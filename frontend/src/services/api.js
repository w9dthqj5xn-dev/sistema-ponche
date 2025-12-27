const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getToken = () => localStorage.getItem('token');

const authHeader = () => ({
  'Authorization': `Bearer ${getToken()}`,
  'Content-Type': 'application/json'
});

// Auth
export const login = async (username, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error en login');
  }
  
  return response.json();
};

// Employees
export const getEmployees = async () => {
  const response = await fetch(`${API_URL}/employees`, {
    headers: authHeader()
  });
  
  if (!response.ok) throw new Error('Error obteniendo empleados');
  return response.json();
};

export const getEmployeesByStore = async (storeId) => {
  const response = await fetch(`${API_URL}/employees/store/${storeId}`, {
    headers: authHeader()
  });
  
  if (!response.ok) throw new Error('Error obteniendo empleados');
  return response.json();
};

export const createEmployee = async (employeeData) => {
  const response = await fetch(`${API_URL}/employees`, {
    method: 'POST',
    headers: authHeader(),
    body: JSON.stringify(employeeData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error creando empleado');
  }
  
  return response.json();
};

export const updateEmployee = async (id, updates) => {
  const response = await fetch(`${API_URL}/employees/${id}`, {
    method: 'PUT',
    headers: authHeader(),
    body: JSON.stringify(updates)
  });
  
  if (!response.ok) throw new Error('Error actualizando empleado');
  return response.json();
};

export const deleteEmployee = async (id) => {
  const response = await fetch(`${API_URL}/employees/${id}`, {
    method: 'DELETE',
    headers: authHeader()
  });
  
  if (!response.ok) throw new Error('Error eliminando empleado');
  return response.json();
};

export const changePassword = async (currentPassword, newPassword) => {
  const response = await fetch(`${API_URL}/employees/change-password`, {
    method: 'PUT',
    headers: authHeader(),
    body: JSON.stringify({ currentPassword, newPassword })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error cambiando contraseña');
  }
  
  return response.json();
};

// Stores
export const getStores = async () => {
  const response = await fetch(`${API_URL}/stores`, {
    headers: authHeader()
  });
  
  if (!response.ok) throw new Error('Error obteniendo tiendas');
  return response.json();
};

export const createStore = async (storeData) => {
  const response = await fetch(`${API_URL}/stores`, {
    method: 'POST',
    headers: authHeader(),
    body: JSON.stringify(storeData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error creando tienda');
  }
  
  return response.json();
};

export const updateStore = async (id, updates) => {
  const response = await fetch(`${API_URL}/stores/${id}`, {
    method: 'PUT',
    headers: authHeader(),
    body: JSON.stringify(updates)
  });
  
  if (!response.ok) throw new Error('Error actualizando tienda');
  return response.json();
};

// Punches
export const getPunches = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`${API_URL}/punches?${params}`, {
    headers: authHeader()
  });
  
  if (!response.ok) throw new Error('Error obteniendo ponches');
  return response.json();
};

export const getMyPunches = async (date = null) => {
  const params = date ? `?date=${date}` : '';
  const response = await fetch(`${API_URL}/punches/my-punches${params}`, {
    headers: authHeader()
  });
  
  if (!response.ok) throw new Error('Error obteniendo ponches');
  return response.json();
};

export const createPunch = async (type) => {
  const response = await fetch(`${API_URL}/punches`, {
    method: 'POST',
    headers: authHeader(),
    body: JSON.stringify({ type })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error registrando ponche');
  }
  
  return response.json();
};

export const getPunchStats = async (date = null) => {
  const params = date ? `?date=${date}` : '';
  const response = await fetch(`${API_URL}/punches/stats/by-store${params}`, {
    headers: authHeader()
  });
  
  if (!response.ok) throw new Error('Error obteniendo estadísticas');
  return response.json();
};

export const getBathroomStats = async () => {
  const response = await fetch(`${API_URL}/punches/stats/bathroom`, {
    headers: authHeader()
  });
  
  if (!response.ok) throw new Error('Error obteniendo estadísticas de baño');
  return response.json();
};
