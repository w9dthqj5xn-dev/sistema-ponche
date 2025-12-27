import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'data.json');

// Estructura inicial de la base de datos
const initialData = {
  users: [
    {
      id: 'admin-1',
      username: 'admin',
      password: '$2a$10$zDYVd7ImYbA39xbwePixwuhHCRYZUwPdODqDiENeqAAn0Xy4yCBAi', // password: admin123
      role: 'admin',
      name: 'Administrador',
      email: 'admin@empresa.com'
    }
  ],
  employees: [],
  stores: [
    {
      id: 'store-1',
      name: 'Tienda Centro',
      address: 'Av. Principal #100',
      createdAt: new Date().toISOString()
    },
    {
      id: 'store-2',
      name: 'Tienda Norte',
      address: 'Zona Norte #200',
      createdAt: new Date().toISOString()
    },
    {
      id: 'store-3',
      name: 'Tienda Sur',
      address: 'Zona Sur #300',
      createdAt: new Date().toISOString()
    },
    {
      id: 'store-4',
      name: 'Tienda Este',
      address: 'Zona Este #400',
      createdAt: new Date().toISOString()
    }
  ],
  punches: []
};

// Inicializar base de datos si no existe
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
}

// Leer datos
export const readDB = () => {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error leyendo la base de datos:', error);
    return initialData;
  }
};

// Escribir datos
export const writeDB = (data) => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error escribiendo en la base de datos:', error);
    return false;
  }
};

// Operaciones CRUD genéricas
export const db = {
  // Usuarios
  getUsers: () => readDB().users,
  getUserById: (id) => readDB().users.find(u => u.id === id),
  getUserByUsername: (username) => readDB().users.find(u => u.username === username),
  addUser: (user) => {
    const data = readDB();
    data.users.push(user);
    writeDB(data);
    return user;
  },
  
  // Empleados
  getEmployees: () => readDB().employees,
  getEmployeeById: (id) => readDB().employees.find(e => e.id === id),
  getEmployeesByStore: (storeId) => readDB().employees.filter(e => e.storeId === storeId),
  addEmployee: (employee) => {
    const data = readDB();
    data.employees.push(employee);
    writeDB(data);
    return employee;
  },
  updateEmployee: (id, updates) => {
    const data = readDB();
    const index = data.employees.findIndex(e => e.id === id);
    if (index !== -1) {
      data.employees[index] = { ...data.employees[index], ...updates };
      writeDB(data);
      return data.employees[index];
    }
    return null;
  },
  deleteEmployee: (id) => {
    const data = readDB();
    const index = data.employees.findIndex(e => e.id === id);
    if (index !== -1) {
      data.employees.splice(index, 1);
      writeDB(data);
      return true;
    }
    return false;
  },
  
  // Tiendas
  getStores: () => readDB().stores,
  getStoreById: (id) => readDB().stores.find(s => s.id === id),
  addStore: (store) => {
    const data = readDB();
    data.stores.push(store);
    writeDB(data);
    return store;
  },
  updateStore: (id, updates) => {
    const data = readDB();
    const index = data.stores.findIndex(s => s.id === id);
    if (index !== -1) {
      data.stores[index] = { ...data.stores[index], ...updates };
      writeDB(data);
      return data.stores[index];
    }
    return null;
  },
  
  // Ponches
  getPunches: () => readDB().punches,
  getPunchById: (id) => readDB().punches.find(p => p.id === id),
  getPunchesByEmployee: (employeeId) => readDB().punches.filter(p => p.employeeId === employeeId),
  getPunchesByStore: (storeId) => readDB().punches.filter(p => p.storeId === storeId),
  getPunchesByDate: (date) => {
    const punches = readDB().punches;
    return punches.filter(p => p.date === date);
  },
  addPunch: (punch) => {
    const data = readDB();
    data.punches.push(punch);
    writeDB(data);
    return punch;
  }
};
