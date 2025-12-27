import { useState, useEffect } from 'react';
import * as api from '../../services/api';

function Dashboard() {
  const [stats, setStats] = useState([]);
  const [punches, setPunches] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [stores, setStores] = useState([]);
  const [bathroomStats, setBathroomStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, punchesData, employeesData, storesData, bathroomData] = await Promise.all([
        api.getPunchStats(selectedDate),
        api.getPunches({ date: selectedDate }),
        api.getEmployees(),
        api.getStores(),
        api.getBathroomStats()
      ]);
      
      setStats(statsData);
      setPunches(punchesData);
      setEmployees(employeesData);
      setStores(storesData);
      setBathroomStats(bathroomData);
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Cargando dashboard...</div>;
  }

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.active).length;
  const totalPunchesToday = punches.length;
  const totalStores = stores.length;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>📊 Dashboard</h1>
        <input 
          type="date" 
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="date-picker"
        />
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Empleados Activos</h3>
            <p className="stat-number">{activeEmployees} / {totalEmployees}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏪</div>
          <div className="stat-content">
            <h3>Tiendas</h3>
            <p className="stat-number">{totalStores}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🕐</div>
          <div className="stat-content">
            <h3>Ponches Hoy</h3>
            <p className="stat-number">{totalPunchesToday}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Empleados que Poncharon</h3>
            <p className="stat-number">{new Set(punches.map(p => p.employeeId)).size}</p>
          </div>
        </div>
      </div>

      <div className="stores-section">
        <h2>📈 Estadísticas por Tienda</h2>
        <div className="stores-stats-grid">
          {stats.map(storeStat => (
            <div key={storeStat.storeId} className="store-stat-card">
              <h3>{storeStat.storeName}</h3>
              <div className="store-stats">
                <div className="store-stat-item">
                  <span className="label">Total Ponches:</span>
                  <span className="value">{storeStat.totalPunches}</span>
                </div>
                <div className="store-stat-item">
                  <span className="label">Empleados:</span>
                  <span className="value">{storeStat.uniqueEmployees}</span>
                </div>
                <div className="store-stat-item">
                  <span className="label">Entradas:</span>
                  <span className="value success">{storeStat.punchesIn}</span>
                </div>
                <div className="store-stat-item">
                  <span className="label">Salidas:</span>
                  <span className="value warning">{storeStat.punchesOut}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bathroom-stats-section">
        <h2>🚽 Empleados con Más Salidas al Baño</h2>
        {bathroomStats.length === 0 ? (
          <p className="no-data">No hay registros de salidas al baño</p>
        ) : (
          <div className="bathroom-chart">
            {bathroomStats.map((stat, index) => {
              const maxCount = bathroomStats[0]?.count || 1;
              const percentage = (stat.count / maxCount) * 100;
              
              return (
                <div key={stat.employeeId} className="bathroom-bar-container">
                  <div className="bathroom-rank">#{index + 1}</div>
                  <div className="bathroom-info">
                    <div className="bathroom-employee">
                      <span className="employee-name">{stat.employeeName}</span>
                      <span className="employee-store">{stat.storeName}</span>
                    </div>
                    <div className="bathroom-bar-wrapper">
                      <div 
                        className="bathroom-bar" 
                        style={{ width: `${percentage}%` }}
                      >
                        <span className="bathroom-count">{stat.count} veces</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="recent-punches">
        <h2>🕐 Últimos Ponches</h2>
        {punches.length === 0 ? (
          <p className="no-data">No hay ponches para esta fecha</p>
        ) : (
          <div className="punches-table-container">
            <table className="punches-table">
              <thead>
                <tr>
                  <th>Empleado</th>
                  <th>Tienda</th>
                  <th>Tipo</th>
                  <th>Hora</th>
                </tr>
              </thead>
              <tbody>
                {punches.slice(0, 10).map(punch => {
                  const typeConfig = {
                    'in': { icon: '⬇️', label: 'Entrada' },
                    'out': { icon: '⬆️', label: 'Salida' },
                    'lunch-out': { icon: '🍽️', label: 'Salida Almuerzo' },
                    'lunch-in': { icon: '🍴', label: 'Entrada Almuerzo' },
                    'bathroom-out': { icon: '🚻', label: 'Salida Baño' },
                    'bathroom-in': { icon: '✅', label: 'Regreso Baño' }
                  };
                  const config = typeConfig[punch.type] || { icon: '❓', label: punch.type };
                  
                  return (
                    <tr key={punch.id}>
                      <td>{punch.employeeName}</td>
                      <td>{punch.storeName}</td>
                      <td>
                        <span className={`badge ${punch.type}`}>
                          {config.icon} {config.label}
                        </span>
                      </td>
                      <td>{punch.time}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
