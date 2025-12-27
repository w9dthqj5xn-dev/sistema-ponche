import express from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import * as db from '../db/postgres.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Obtener todos los empleados (solo admin)
router.get('/', authMiddleware, adminOnly, (req, res) => {
  try {
    const employees = db.getEmployees();
    // No enviar contraseñas
    const safeEmployees = employees.map(({ password, ...emp }) => emp);
    res.json(safeEmployees);
  } catch (error) {
    console.error('Error obteniendo empleados:', error);
    res.status(500).json({ error: 'Error obteniendo empleados' });
  }
});

// Obtener empleados por tienda
router.get('/store/:storeId', authMiddleware, adminOnly, (req, res) => {
  try {
    const { storeId } = req.params;
    const employees = db.getEmployeesByStore(storeId);
    const safeEmployees = employees.map(({ password, ...emp }) => emp);
    res.json(safeEmployees);
  } catch (error) {
    console.error('Error obteniendo empleados:', error);
    res.status(500).json({ error: 'Error obteniendo empleados' });
  }
});

// Obtener un empleado por ID
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const employee = db.getEmployeeById(id);
    
    if (!employee) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    // Los empleados solo pueden ver su propia info
    if (req.user.role === 'employee' && req.user.id !== id) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const { password, ...safeEmployee } = employee;
    res.json(safeEmployee);
  } catch (error) {
    console.error('Error obteniendo empleado:', error);
    res.status(500).json({ error: 'Error obteniendo empleado' });
  }
});

// Crear nuevo empleado (solo admin)
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { name, employeeCode, storeId, position, phone, email } = req.body;

    if (!name || !employeeCode || !storeId) {
      return res.status(400).json({ error: 'Nombre, código de empleado y tienda son requeridos' });
    }

    // Verificar si el código de empleado ya existe
    const existingEmployee = db.getEmployees().find(e => e.employeeCode === employeeCode);
    if (existingEmployee) {
      return res.status(400).json({ error: 'El código de empleado ya existe' });
    }

    // Verificar que la tienda existe
    const store = db.getStoreById(storeId);
    if (!store) {
      return res.status(400).json({ error: 'Tienda no encontrada' });
    }

    // Contraseña por defecto: mismo código de empleado
    const hashedPassword = await bcrypt.hash(employeeCode, 10);

    const newEmployee = {
      id: uuidv4(),
      name,
      employeeCode,
      password: hashedPassword,
      storeId,
      position: position || 'Empleado',
      phone: phone || '',
      email: email || '',
      active: true,
      createdAt: new Date().toISOString()
    };

    db.addEmployee(newEmployee);

    const { password, ...safeEmployee } = newEmployee;
    res.status(201).json(safeEmployee);
  } catch (error) {
    console.error('Error creando empleado:', error);
    res.status(500).json({ error: 'Error creando empleado' });
  }
});

// Cambiar contraseña (empleado autenticado) - DEBE IR ANTES DE PUT /:id
router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Contraseña actual y nueva contraseña requeridas' });
    }

    if (newPassword.length < 4) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 4 caracteres' });
    }

    const employee = db.getEmployeeById(req.user.id);
    if (!employee) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    // Verificar contraseña actual
    const isMatch = await bcrypt.compare(currentPassword, employee.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Contraseña actual incorrecta' });
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Actualizar contraseña
    const updates = {
      password: hashedPassword,
      updatedAt: new Date().toISOString()
    };

    db.updateEmployee(req.user.id, updates);
    
    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    res.status(500).json({ error: 'Error cambiando contraseña' });
  }
});

// Actualizar empleado (solo admin)
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, position, phone, email, active } = req.body;

    const employee = db.getEmployeeById(id);
    if (!employee) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (position !== undefined) updates.position = position;
    if (phone !== undefined) updates.phone = phone;
    if (email !== undefined) updates.email = email;
    if (active !== undefined) updates.active = active;
    updates.updatedAt = new Date().toISOString();

    const updatedEmployee = db.updateEmployee(id, updates);
    const { password, ...safeEmployee } = updatedEmployee;
    
    res.json(safeEmployee);
  } catch (error) {
    console.error('Error actualizando empleado:', error);
    res.status(500).json({ error: 'Error actualizando empleado' });
  }
});

// Eliminar empleado (solo admin)
router.delete('/:id', authMiddleware, adminOnly, (req, res) => {
  try {
    const { id } = req.params;
    
    const employee = db.getEmployeeById(id);
    if (!employee) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    db.deleteEmployee(id);
    res.json({ message: 'Empleado eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando empleado:', error);
    res.status(500).json({ error: 'Error eliminando empleado' });
  }
});

export default router;
