import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Función para inicializar las tablas
export const initDatabase = async () => {
  const client = await pool.connect();
  
  try {
    // Crear tablas
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL,
        name VARCHAR(200) NOT NULL,
        email VARCHAR(200),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS stores (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        address VARCHAR(300),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id VARCHAR(50) PRIMARY KEY,
        employee_code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(200) NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(200),
        phone VARCHAR(50),
        store_id VARCHAR(50) REFERENCES stores(id),
        position VARCHAR(100),
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS punches (
        id VARCHAR(50) PRIMARY KEY,
        employee_id VARCHAR(50) REFERENCES employees(id) ON DELETE CASCADE,
        store_id VARCHAR(50) REFERENCES stores(id),
        type VARCHAR(20) NOT NULL,
        date VARCHAR(20) NOT NULL,
        time VARCHAR(20) NOT NULL,
        timestamp BIGINT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Crear índices para mejorar el rendimiento
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_employees_store ON employees(store_id);
      CREATE INDEX IF NOT EXISTS idx_punches_employee ON punches(employee_id);
      CREATE INDEX IF NOT EXISTS idx_punches_store ON punches(store_id);
      CREATE INDEX IF NOT EXISTS idx_punches_date ON punches(date);
    `);

    // Verificar si ya existe el usuario admin
    const result = await client.query('SELECT * FROM users WHERE username = $1', ['admin']);
    
    if (result.rows.length === 0) {
      // Insertar datos iniciales
      await client.query(`
        INSERT INTO users (id, username, password, role, name, email)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, ['admin-1', 'admin', '$2a$10$zDYVd7ImYbA39xbwePixwuhHCRYZUwPdODqDiENeqAAn0Xy4yCBAi', 'admin', 'Administrador', 'admin@empresa.com']);

      // Insertar tiendas iniciales
      const stores = [
        ['store-1', 'Tienda Centro', 'Av. Principal #100'],
        ['store-2', 'Tienda Norte', 'Zona Norte #200'],
        ['store-3', 'Tienda Sur', 'Zona Sur #300'],
        ['store-4', 'Tienda Este', 'Zona Este #400']
      ];

      for (const [id, name, address] of stores) {
        await client.query(`
          INSERT INTO stores (id, name, address)
          VALUES ($1, $2, $3)
          ON CONFLICT (id) DO NOTHING
        `, [id, name, address]);
      }
    }

    console.log('✅ Base de datos inicializada correctamente');
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Operaciones CRUD con PostgreSQL
export const db = {
  // Usuarios
  getUsers: async () => {
    const result = await pool.query('SELECT * FROM users');
    return result.rows;
  },
  
  getUserById: async (id) => {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  },
  
  getUserByUsername: async (username) => {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0];
  },
  
  addUser: async (user) => {
    const { id, username, password, role, name, email } = user;
    const result = await pool.query(
      'INSERT INTO users (id, username, password, role, name, email) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [id, username, password, role, name, email]
    );
    return result.rows[0];
  },
  
  // Empleados
  getEmployees: async () => {
    const result = await pool.query('SELECT * FROM employees ORDER BY name');
    return result.rows.map(row => ({
      id: row.id,
      employeeCode: row.employee_code,
      name: row.name,
      password: row.password,
      email: row.email,
      phone: row.phone,
      storeId: row.store_id,
      position: row.position,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  },
  
  getEmployeeById: async (id) => {
    const result = await pool.query('SELECT * FROM employees WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      id: row.id,
      employeeCode: row.employee_code,
      name: row.name,
      password: row.password,
      email: row.email,
      phone: row.phone,
      storeId: row.store_id,
      position: row.position,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  },
  
  getEmployeesByStore: async (storeId) => {
    const result = await pool.query('SELECT * FROM employees WHERE store_id = $1 ORDER BY name', [storeId]);
    return result.rows.map(row => ({
      id: row.id,
      employeeCode: row.employee_code,
      name: row.name,
      password: row.password,
      email: row.email,
      phone: row.phone,
      storeId: row.store_id,
      position: row.position,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  },
  
  addEmployee: async (employee) => {
    const { id, employeeCode, name, password, email, phone, storeId, position, status } = employee;
    const result = await pool.query(
      'INSERT INTO employees (id, employee_code, name, password, email, phone, store_id, position, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [id, employeeCode, name, password, email, phone, storeId, position, status || 'active']
    );
    const row = result.rows[0];
    return {
      id: row.id,
      employeeCode: row.employee_code,
      name: row.name,
      password: row.password,
      email: row.email,
      phone: row.phone,
      storeId: row.store_id,
      position: row.position,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  },
  
  updateEmployee: async (id, updates) => {
    const fields = [];
    const values = [];
    let paramCount = 1;
    
    if (updates.employeeCode !== undefined) {
      fields.push(`employee_code = $${paramCount++}`);
      values.push(updates.employeeCode);
    }
    if (updates.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(updates.name);
    }
    if (updates.password !== undefined) {
      fields.push(`password = $${paramCount++}`);
      values.push(updates.password);
    }
    if (updates.email !== undefined) {
      fields.push(`email = $${paramCount++}`);
      values.push(updates.email);
    }
    if (updates.phone !== undefined) {
      fields.push(`phone = $${paramCount++}`);
      values.push(updates.phone);
    }
    if (updates.storeId !== undefined) {
      fields.push(`store_id = $${paramCount++}`);
      values.push(updates.storeId);
    }
    if (updates.position !== undefined) {
      fields.push(`position = $${paramCount++}`);
      values.push(updates.position);
    }
    if (updates.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(updates.status);
    }
    
    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    
    const query = `UPDATE employees SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      id: row.id,
      employeeCode: row.employee_code,
      name: row.name,
      email: row.email,
      phone: row.phone,
      storeId: row.store_id,
      position: row.position,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  },
  
  deleteEmployee: async (id) => {
    const result = await pool.query('DELETE FROM employees WHERE id = $1', [id]);
    return result.rowCount > 0;
  },
  
  // Tiendas
  getStores: async () => {
    const result = await pool.query('SELECT * FROM stores ORDER BY name');
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      address: row.address,
      createdAt: row.created_at
    }));
  },
  
  getStoreById: async (id) => {
    const result = await pool.query('SELECT * FROM stores WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      address: row.address,
      createdAt: row.created_at
    };
  },
  
  addStore: async (store) => {
    const { id, name, address } = store;
    const result = await pool.query(
      'INSERT INTO stores (id, name, address) VALUES ($1, $2, $3) RETURNING *',
      [id, name, address]
    );
    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      address: row.address,
      createdAt: row.created_at
    };
  },
  
  updateStore: async (id, updates) => {
    const fields = [];
    const values = [];
    let paramCount = 1;
    
    if (updates.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(updates.name);
    }
    if (updates.address !== undefined) {
      fields.push(`address = $${paramCount++}`);
      values.push(updates.address);
    }
    
    values.push(id);
    const query = `UPDATE stores SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      address: row.address,
      createdAt: row.created_at
    };
  },
  
  // Ponches
  getPunches: async () => {
    const result = await pool.query('SELECT * FROM punches ORDER BY timestamp DESC');
    return result.rows.map(row => ({
      id: row.id,
      employeeId: row.employee_id,
      storeId: row.store_id,
      type: row.type,
      date: row.date,
      time: row.time,
      timestamp: row.timestamp,
      createdAt: row.created_at
    }));
  },
  
  getPunchById: async (id) => {
    const result = await pool.query('SELECT * FROM punches WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      id: row.id,
      employeeId: row.employee_id,
      storeId: row.store_id,
      type: row.type,
      date: row.date,
      time: row.time,
      timestamp: row.timestamp,
      createdAt: row.created_at
    };
  },
  
  getPunchesByEmployee: async (employeeId) => {
    const result = await pool.query(
      'SELECT * FROM punches WHERE employee_id = $1 ORDER BY timestamp DESC',
      [employeeId]
    );
    return result.rows.map(row => ({
      id: row.id,
      employeeId: row.employee_id,
      storeId: row.store_id,
      type: row.type,
      date: row.date,
      time: row.time,
      timestamp: row.timestamp,
      createdAt: row.created_at
    }));
  },
  
  getPunchesByStore: async (storeId) => {
    const result = await pool.query(
      'SELECT * FROM punches WHERE store_id = $1 ORDER BY timestamp DESC',
      [storeId]
    );
    return result.rows.map(row => ({
      id: row.id,
      employeeId: row.employee_id,
      storeId: row.store_id,
      type: row.type,
      date: row.date,
      time: row.time,
      timestamp: row.timestamp,
      createdAt: row.created_at
    }));
  },
  
  getPunchesByDate: async (date) => {
    const result = await pool.query(
      'SELECT * FROM punches WHERE date = $1 ORDER BY timestamp DESC',
      [date]
    );
    return result.rows.map(row => ({
      id: row.id,
      employeeId: row.employee_id,
      storeId: row.store_id,
      type: row.type,
      date: row.date,
      time: row.time,
      timestamp: row.timestamp,
      createdAt: row.created_at
    }));
  },
  
  addPunch: async (punch) => {
    const { id, employeeId, storeId, type, date, time, timestamp } = punch;
    const result = await pool.query(
      'INSERT INTO punches (id, employee_id, store_id, type, date, time, timestamp) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [id, employeeId, storeId, type, date, time, timestamp]
    );
    const row = result.rows[0];
    return {
      id: row.id,
      employeeId: row.employee_id,
      storeId: row.store_id,
      type: row.type,
      date: row.date,
      time: row.time,
      timestamp: row.timestamp,
      createdAt: row.created_at
    };
  }
};

export default pool;
