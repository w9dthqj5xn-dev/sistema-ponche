import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Obtener todos los ponches (solo admin)
router.get('/', authMiddleware, adminOnly, (req, res) => {
  try {
    const { date, storeId, employeeId } = req.query;
    let punches = db.getPunches();

    if (date) {
      punches = punches.filter(p => p.date === date);
    }

    if (storeId) {
      punches = punches.filter(p => p.storeId === storeId);
    }

    if (employeeId) {
      punches = punches.filter(p => p.employeeId === employeeId);
    }

    // Agregar información del empleado y tienda
    const enrichedPunches = punches.map(punch => {
      const employee = db.getEmployeeById(punch.employeeId);
      const store = db.getStoreById(punch.storeId);
      return {
        ...punch,
        employeeName: employee?.name || 'Desconocido',
        storeName: store?.name || 'Desconocido'
      };
    });

    res.json(enrichedPunches);
  } catch (error) {
    console.error('Error obteniendo ponches:', error);
    res.status(500).json({ error: 'Error obteniendo ponches' });
  }
});

// Obtener ponches del empleado actual
router.get('/my-punches', authMiddleware, (req, res) => {
  try {
    const { date } = req.query;
    let punches = db.getPunchesByEmployee(req.user.id);

    if (date) {
      punches = punches.filter(p => p.date === date);
    }

    // Ordenar por fecha y hora descendente
    punches.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(punches);
  } catch (error) {
    console.error('Error obteniendo ponches:', error);
    res.status(500).json({ error: 'Error obteniendo ponches' });
  }
});

// Registrar ponche (entrada o salida)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { type } = req.body; // 'in', 'out', 'lunch-out', 'lunch-in', 'bathroom-out', 'bathroom-in'

    if (!type || !['in', 'out', 'lunch-out', 'lunch-in', 'bathroom-out', 'bathroom-in'].includes(type)) {
      return res.status(400).json({ error: 'Tipo de ponche inválido' });
    }

    const employee = db.getEmployeeById(req.user.id);
    if (!employee) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    if (!employee.active) {
      return res.status(403).json({ error: 'Empleado inactivo' });
    }

    const now = new Date();
    const timestamp = now.toISOString();
    
    // Obtener fecha y hora en la zona horaria de República Dominicana (America/Santo_Domingo)
    const localTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Santo_Domingo' }));
    const date = localTime.toISOString().split('T')[0]; // YYYY-MM-DD
    const time = localTime.toLocaleTimeString('es-DO', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true 
    });

    // Verificar si ya existe un ponche del mismo tipo hoy (solo para in, out, lunch-out, lunch-in)
    const restrictedTypes = ['in', 'out', 'lunch-out', 'lunch-in'];
    if (restrictedTypes.includes(type)) {
      const todayPunches = db.getPunchesByEmployee(req.user.id).filter(p => p.date === date);
      const existingPunch = todayPunches.find(p => p.type === type);
      
      if (existingPunch) {
        const typeNames = {
          'in': 'entrada',
          'out': 'salida',
          'lunch-out': 'salida de almuerzo',
          'lunch-in': 'entrada de almuerzo'
        };
        return res.status(400).json({ 
          error: `Ya registraste un ponche de ${typeNames[type]} hoy a las ${existingPunch.time}` 
        });
      }
    }

    const punch = {
      id: uuidv4(),
      employeeId: req.user.id,
      employeeName: employee.name,
      storeId: employee.storeId,
      type, // 'in' o 'out'
      timestamp,
      date,
      time,
      createdAt: timestamp
    };

    db.addPunch(punch);

    // Agregar nombre de la tienda para la respuesta
    const store = db.getStoreById(employee.storeId);
    const response = {
      ...punch,
      storeName: store?.name || 'Desconocido'
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error registrando ponche:', error);
    res.status(500).json({ error: 'Error registrando ponche' });
  }
});

// Obtener estadísticas de ponches por tienda (admin)
router.get('/stats/by-store', authMiddleware, adminOnly, (req, res) => {
  try {
    const { date } = req.query;
    const stores = db.getStores();
    
    const stats = stores.map(store => {
      let punches = db.getPunchesByStore(store.id);
      
      if (date) {
        punches = punches.filter(p => p.date === date);
      }

      const totalPunches = punches.length;
      const uniqueEmployees = new Set(punches.map(p => p.employeeId)).size;
      const punchesIn = punches.filter(p => p.type === 'in').length;
      const punchesOut = punches.filter(p => p.type === 'out').length;

      return {
        storeId: store.id,
        storeName: store.name,
        totalPunches,
        uniqueEmployees,
        punchesIn,
        punchesOut
      };
    });

    res.json(stats);
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error obteniendo estadísticas' });
  }
});

// Obtener estadísticas de salidas al baño por empleado (admin)
router.get('/stats/bathroom', authMiddleware, adminOnly, (req, res) => {
  try {
    const allPunches = db.getPunches();
    const bathroomPunches = allPunches.filter(p => p.type === 'bathroom-out');
    
    // Agrupar por empleado y contar
    const employeeStats = {};
    bathroomPunches.forEach(punch => {
      if (!employeeStats[punch.employeeId]) {
        const employee = db.getEmployeeById(punch.employeeId);
        const store = db.getStoreById(punch.storeId);
        employeeStats[punch.employeeId] = {
          employeeId: punch.employeeId,
          employeeName: punch.employeeName || employee?.name || 'Desconocido',
          storeName: store?.name || 'Desconocido',
          count: 0
        };
      }
      employeeStats[punch.employeeId].count++;
    });

    // Convertir a array y ordenar por mayor cantidad
    const sortedStats = Object.values(employeeStats)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10

    res.json(sortedStats);
  } catch (error) {
    console.error('Error obteniendo estadísticas de baño:', error);
    res.status(500).json({ error: 'Error obteniendo estadísticas' });
  }
});

export default router;
