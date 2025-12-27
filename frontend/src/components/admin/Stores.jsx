import { useState, useEffect } from 'react';
import * as api from '../../services/api';

function Stores() {
  const [stores, setStores] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [storesData, employeesData] = await Promise.all([
        api.getStores(),
        api.getEmployees()
      ]);
      setStores(storesData);
      setEmployees(employeesData);
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (store = null) => {
    if (store) {
      setEditingStore(store);
      setFormData({
        name: store.name,
        address: store.address || ''
      });
    } else {
      setEditingStore(null);
      setFormData({
        name: '',
        address: ''
      });
    }
    setShowModal(true);
    setError('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingStore(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingStore) {
        await api.updateStore(editingStore.id, formData);
      } else {
        await api.createStore(formData);
      }
      await loadData();
      handleCloseModal();
    } catch (err) {
      setError(err.message);
    }
  };

  const getEmployeeCount = (storeId) => {
    return employees.filter(e => e.storeId === storeId).length;
  };

  if (loading) {
    return <div className="loading">Cargando tiendas...</div>;
  }

  return (
    <div className="stores-page">
      <div className="page-header">
        <h1>🏪 Gestión de Tiendas</h1>
        <button onClick={() => handleOpenModal()} className="btn-primary">
          ➕ Agregar Tienda
        </button>
      </div>

      <div className="stores-grid">
        {stores.length === 0 ? (
          <p className="no-data">No hay tiendas registradas</p>
        ) : (
          stores.map(store => (
            <div key={store.id} className="store-card">
              <div className="store-card-header">
                <h3>🏪 {store.name}</h3>
                <div className="store-actions">
                  <button 
                    onClick={() => handleOpenModal(store)}
                    className="btn-icon"
                    title="Editar"
                  >
                    ✏️
                  </button>
                </div>
              </div>
              
              <div className="store-card-body">
                <p className="store-address">
                  📍 {store.address || 'Sin dirección'}
                </p>
                
                <div className="store-stats">
                  <div className="store-stat">
                    <span className="stat-label">Empleados:</span>
                    <span className="stat-value">{getEmployeeCount(store.id)}</span>
                  </div>
                </div>

                <p className="store-date">
                  📅 Creada: {new Date(store.createdAt).toLocaleDateString('es-MX')}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingStore ? 'Editar Tienda' : 'Nueva Tienda'}</h2>
              <button onClick={handleCloseModal} className="close-btn">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              {error && <div className="alert alert-error">{error}</div>}

              <div className="form-group">
                <label>Nombre de la tienda *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="Ej: Tienda Centro"
                />
              </div>

              <div className="form-group">
                <label>Dirección</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Ej: Av. Principal #100"
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={handleCloseModal} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingStore ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Stores;
