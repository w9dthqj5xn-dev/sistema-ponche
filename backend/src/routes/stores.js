import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as db from '../db/postgres.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Obtener todas las tiendas
router.get('/', authMiddleware, (req, res) => {
  try {
    const stores = db.db.getStores();
    res.json(stores);
  } catch (error) {
    console.error('Error obteniendo tiendas:', error);
    res.status(500).json({ error: 'Error obteniendo tiendas' });
  }
});

// Obtener una tienda por ID
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const store = db.db.getStoreById(id);
    
    if (!store) {
      return res.status(404).json({ error: 'Tienda no encontrada' });
    }

    res.json(store);
  } catch (error) {
    console.error('Error obteniendo tienda:', error);
    res.status(500).json({ error: 'Error obteniendo tienda' });
  }
});

// Crear nueva tienda (solo admin)
router.post('/', authMiddleware, adminOnly, (req, res) => {
  try {
    const { name, address } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'El nombre de la tienda es requerido' });
    }

    // Verificar que no exista una tienda con el mismo nombre
    const existingStore = db.db.getStores().find(s => s.name.toLowerCase() === name.toLowerCase());
    if (existingStore) {
      return res.status(400).json({ error: 'Ya existe una tienda con ese nombre' });
    }

    const newStore = {
      id: uuidv4(),
      name,
      address: address || '',
      createdAt: new Date().toISOString()
    };

    db.db.addStore(newStore);
    res.status(201).json(newStore);
  } catch (error) {
    console.error('Error creando tienda:', error);
    res.status(500).json({ error: 'Error creando tienda' });
  }
});

// Actualizar tienda (solo admin)
router.put('/:id', authMiddleware, adminOnly, (req, res) => {
  try {
    const { id } = req.params;
    const { name, address } = req.body;

    const store = db.db.getStoreById(id);
    if (!store) {
      return res.status(404).json({ error: 'Tienda no encontrada' });
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (address !== undefined) updates.address = address;
    updates.updatedAt = new Date().toISOString();

    const updatedStore = db.db.updateStore(id, updates);
    res.json(updatedStore);
  } catch (error) {
    console.error('Error actualizando tienda:', error);
    res.status(500).json({ error: 'Error actualizando tienda' });
  }
});

export default router;
