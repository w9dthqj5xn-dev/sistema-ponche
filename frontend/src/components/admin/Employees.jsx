import { useState, useEffect } from 'react';
import * as api from '../../services/api';

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    employeeCode: '',
    storeId: '',
    position: '',
    phone: '',
    email: ''
  });
  const [error, setError] = useState('');
  const [filterStore, setFilterStore] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [employeesData, storesData] = await Promise.all([
        api.getEmployees(),
        api.getStores()
      ]);
      setEmployees(employeesData);
      setStores(storesData);
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (employee = null) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        name: employee.name,
        employeeCode: employee.employeeCode,
        storeId: employee.storeId,
        position: employee.position || '',
        phone: employee.phone || '',
        email: employee.email || ''
      });
    } else {
      setEditingEmployee(null);
      setFormData({
        name: '',
        employeeCode: '',
        storeId: stores[0]?.id || '',
        position: '',
        phone: '',
        email: ''
      });
    }
    setShowModal(true);
    setError('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEmployee(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingEmployee) {
        await api.updateEmployee(editingEmployee.id, formData);
      } else {
        await api.createEmployee(formData);
      }
      await loadData();
      handleCloseModal();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este empleado?')) return;

    try {
      await api.deleteEmployee(id);
      await loadData();
    } catch (err) {
      alert('Error eliminando empleado: ' + err.message);
    }
  };

  const filteredEmployees = filterStore === 'all' 
    ? employees 
    : employees.filter(e => e.storeId === filterStore);

  if (loading) {
    return <div className="loading">Cargando empleados...</div>;
  }

  return (
    <div className="employees-page">
      <div className="page-header">
        <h1>👥 Gestión de Empleados</h1>
        <button onClick={() => handleOpenModal()} className="btn-primary">
          ➕ Agregar Empleado
        </button>
      </div>

      <div className="filters">
        <label>
          Filtrar por tienda:
          <select value={filterStore} onChange={(e) => setFilterStore(e.target.value)}>
            <option value="all">Todas las tiendas</option>
            {stores.map(store => (
              <option key={store.id} value={store.id}>{store.name}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Código</th>
              <th>Tienda</th>
              <th>Puesto</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">No hay empleados registrados</td>
              </tr>
            ) : (
              filteredEmployees.map(employee => {
                const store = stores.find(s => s.id === employee.storeId);
                return (
                  <tr key={employee.id}>
                    <td><strong>{employee.name}</strong></td>
                    <td><code>{employee.employeeCode}</code></td>
                    <td>{store?.name || 'N/A'}</td>
                    <td>{employee.position || 'N/A'}</td>
                    <td>{employee.phone || 'N/A'}</td>
                    <td>{employee.email || 'N/A'}</td>
                    <td>
                      <span className={`badge ${employee.status === 'active' ? 'success' : 'danger'}`}>
                        {employee.status === 'active' ? '✅ Activo' : '❌ Inactivo'}
                      </span>
                    </td>
                    <td className="actions">
                      <button 
                        onClick={() => handleOpenModal(employee)}
                        className="btn-icon"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleDelete(employee.id)}
                        className="btn-icon danger"
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingEmployee ? 'Editar Empleado' : 'Nuevo Empleado'}</h2>
              <button onClick={handleCloseModal} className="close-btn">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              {error && <div className="alert alert-error">{error}</div>}

              <div className="form-group">
                <label>Nombre completo *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              {!editingEmployee && (
                <div className="form-group">
                  <label>Código de empleado *</label>
                  <input
                    type="text"
                    value={formData.employeeCode}
                    onChange={(e) => setFormData({...formData, employeeCode: e.target.value})}
                    required
                    placeholder="Ej: EMP001"
                  />
                  <small>Este código se usará como contraseña inicial</small>
                </div>
              )}

              <div className="form-group">
                <label>Tienda *</label>
                <select
                  value={formData.storeId}
                  onChange={(e) => setFormData({...formData, storeId: e.target.value})}
                  required
                >
                  <option value="">Seleccionar tienda</option>
                  {stores.map(store => (
                    <option key={store.id} value={store.id}>{store.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Puesto</label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: e.target.value})}
                  placeholder="Ej: Vendedor, Cajero"
                />
              </div>

              <div className="form-group">
                <label>Teléfono</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="Ej: 555-1234"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="Ej: empleado@empresa.com"
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={handleCloseModal} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingEmployee ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Employees;
