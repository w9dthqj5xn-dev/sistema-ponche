import { useState, useEffect } from 'react';
import * as api from '../../services/api';

function Punches() {
  const [punches, setPunches] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterStore, setFilterStore] = useState('all');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadData();
  }, [selectedDate, filterStore]);

  const loadData = async () => {
    try {
      setLoading(true);
      const filters = { date: selectedDate };
      if (filterStore !== 'all') {
        filters.storeId = filterStore;
      }

      const [punchesData, storesData] = await Promise.all([
        api.getPunches(filters),
        api.getStores()
      ]);
      
      setPunches(punchesData);
      setStores(storesData);
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPunches = filterType === 'all'
    ? punches
    : punches.filter(p => p.type === filterType);

  const groupPunchesByEmployee = (punchesData) => {
    const grouped = {};
    punchesData.forEach(punch => {
      const key = punch.employeeId;
      if (!grouped[key]) {
        grouped[key] = {
          employeeName: punch.employeeName,
          storeName: punch.storeName,
          punches: []
        };
      }
      grouped[key].punches.push(punch);
    });
    return grouped;
  };

  const punchesByEmployee = groupPunchesByEmployee(filteredPunches);

  if (loading) {
    return <div className="loading">Cargando ponches...</div>;
  }

  return (
    <div className="punches-page">
      <div className="page-header">
        <h1>🕐 Registro de Ponches</h1>
      </div>

      <div className="filters-bar">
        <div className="filter-group">
          <label>Fecha:</label>
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-picker"
          />
        </div>

        <div className="filter-group">
          <label>Tienda:</label>
          <select value={filterStore} onChange={(e) => setFilterStore(e.target.value)}>
            <option value="all">Todas las tiendas</option>
            {stores.map(store => (
              <option key={store.id} value={store.id}>{store.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Tipo:</label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">Todos</option>
            <option value="in">Entradas</option>
            <option value="out">Salidas</option>
            <option value="lunch-out">Salidas Almuerzo</option>
            <option value="lunch-in">Entradas Almuerzo</option>
            <option value="bathroom-out">Salidas Baño</option>
            <option value="bathroom-in">Regresos Baño</option>
          </select>
        </div>
      </div>

      <div className="stats-summary">
        <div className="stat-box">
          <span className="stat-label">Total Ponches:</span>
          <span className="stat-value">{filteredPunches.length}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Empleados:</span>
          <span className="stat-value">{Object.keys(punchesByEmployee).length}</span>
        </div>
        <div className="stat-box success">
          <span className="stat-label">⬇️ Entradas:</span>
          <span className="stat-value">{filteredPunches.filter(p => p.type === 'in').length}</span>
        </div>
        <div className="stat-box warning">
          <span className="stat-label">⬆️ Salidas:</span>
          <span className="stat-value">{filteredPunches.filter(p => p.type === 'out').length}</span>
        </div>
      </div>

      {Object.keys(punchesByEmployee).length === 0 ? (
        <p className="no-data">No hay ponches para los filtros seleccionados</p>
      ) : (
        <div className="employees-punches">
          {Object.entries(punchesByEmployee).map(([employeeId, data]) => (
            <div key={employeeId} className="employee-punch-card">
              <div className="employee-punch-header">
                <h3>{data.employeeName}</h3>
                <span className="store-badge">{data.storeName}</span>
              </div>
              
              <div className="punches-timeline">
                {data.punches
                  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                  .map(punch => {
                    const typeConfig = {
                      'in': { icon: '⬇️', label: 'Entrada' },
                      'out': { icon: '⬆️', label: 'Salida' },
                      'lunch-out': { icon: '🍽️', label: 'Salida Almuerzo' },
                      'lunch-in': { icon: '🍴', label: 'Entrada Almuerzo' },
                      'bathroom-out': { icon: '�', label: 'Salida Baño' },
                      'bathroom-in': { icon: '✅', label: 'Regreso Baño' }
                    };
                    const config = typeConfig[punch.type] || { icon: '❓', label: punch.type };
                    
                    return (
                      <div key={punch.id} className={`punch-item ${punch.type}`}>
                        <span className="punch-icon">
                          {config.icon}
                        </span>
                        <div className="punch-details">
                          <span className="punch-type">
                            {config.label}
                          </span>
                          <span className="punch-time">⏰ {punch.time}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Punches;
