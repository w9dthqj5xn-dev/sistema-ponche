import { useState, useEffect } from 'react';
import * as api from '../services/api';
import '../styles/EmployeeDashboard.css';

function EmployeeDashboard({ user, onLogout }) {
  const [punches, setPunches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    loadPunches();
  }, [selectedDate]);

  const loadPunches = async () => {
    try {
      const data = await api.getMyPunches(selectedDate);
      setPunches(data);
    } catch (err) {
      console.error('Error cargando ponches:', err);
    }
  };

  const handlePunch = async (type) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const punch = await api.createPunch(type);
      const typeNames = {
        'in': 'entrada',
        'out': 'salida',
        'lunch-out': 'salida de almuerzo',
        'lunch-in': 'entrada de almuerzo',
        'bathroom-out': 'salida al baño',
        'bathroom-in': 'regreso del baño'
      };
      setSuccess(`✅ Ponche de ${typeNames[type]} registrado exitosamente a las ${punch.time}`);
      loadPunches();
      
      // Limpiar mensaje de éxito después de 5 segundos
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Las contraseñas nuevas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 4) {
      setPasswordError('La contraseña debe tener al menos 4 caracteres');
      return;
    }

    try {
      await api.changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordSuccess('✅ Contraseña actualizada correctamente');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess('');
      }, 2000);
    } catch (err) {
      setPasswordError(err.message);
    }
  };

  const groupPunchesByDate = (punchesData) => {
    const grouped = {};
    punchesData.forEach(punch => {
      if (!grouped[punch.date]) {
        grouped[punch.date] = [];
      }
      grouped[punch.date].push(punch);
    });
    
    // Ordenar ponches dentro de cada fecha de más reciente a más antiguo
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    });
    
    return grouped;
  };

  // Verificar qué ponches ya se hicieron hoy
  const today = new Date().toISOString().split('T')[0];
  const todayPunches = punches.filter(p => p.date === today);
  const punchesTypes = todayPunches.map(p => p.type);

  const punchesByDate = groupPunchesByDate(punches);

  return (
    <div className="employee-dashboard">
      <header className="employee-header">
        <div>
          <h1>👋 Bienvenido, {user.name}</h1>
          <p className="subtitle">Registra tu entrada y salida</p>
        </div>
        <div className="header-actions">
          <button onClick={() => setShowPasswordModal(true)} className="change-password-btn">
            🔑 Cambiar Contraseña
          </button>
          <button onClick={onLogout} className="logout-btn">
            🚪 Salir
          </button>
        </div>
      </header>

      {error && (
        <div className="alert alert-error">
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      <div className="punch-actions">
        <button 
          onClick={() => handlePunch('in')} 
          disabled={loading || punchesTypes.includes('in')}
          className="punch-btn punch-in"
        >
          <span className="punch-icon">⬇️</span>
          <span className="punch-label">Entrada</span>
        </button>

        <button 
          onClick={() => handlePunch('lunch-out')} 
          disabled={loading || punchesTypes.includes('lunch-out')}
          className="punch-btn punch-lunch-out"
        >
          <span className="punch-icon">🍽️</span>
          <span className="punch-label">Salida Almuerzo</span>
        </button>

        <button 
          onClick={() => handlePunch('lunch-in')} 
          disabled={loading || punchesTypes.includes('lunch-in')}
          className="punch-btn punch-lunch-in"
        >
          <span className="punch-icon">🍴</span>
          <span className="punch-label">Entrada Almuerzo</span>
        </button>

        <button 
          onClick={() => handlePunch('bathroom-out')} 
          disabled={loading}
          className="punch-btn punch-bathroom-out"
        >
          <span className="punch-icon">🚻</span>
          <span className="punch-label">Salida Baño</span>
        </button>

        <button 
          onClick={() => handlePunch('bathroom-in')} 
          disabled={loading}
          className="punch-btn punch-bathroom-in"
        >
          <span className="punch-icon">✅</span>
          <span className="punch-label">Regreso Baño</span>
        </button>

        <button 
          onClick={() => handlePunch('out')} 
          disabled={loading || punchesTypes.includes('out')}
          className="punch-btn punch-out"
        >
          <span className="punch-icon">⬆️</span>
          <span className="punch-label">Salida</span>
        </button>
      </div>

      <div className="punch-history">
        <div className="history-header">
          <h2>📋 Historial de Ponches</h2>
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-picker"
          />
        </div>

        {Object.keys(punchesByDate).length === 0 ? (
          <p className="no-data">No hay ponches para esta fecha</p>
        ) : (
          Object.entries(punchesByDate).map(([date, datePunches]) => (
            <div key={date} className="date-group">
              <h3 className="date-header">
                📅 {new Date(date + 'T00:00:00').toLocaleDateString('es-MX', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              <div className="punches-list">
                {datePunches.map(punch => {
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
                      <span className="punch-type-icon">
                        {config.icon}
                      </span>
                      <div className="punch-info">
                        <span className="punch-type-text">
                          {config.label}
                        </span>
                        <span className="punch-time">⏰ {punch.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal para cambiar contraseña */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🔑 Cambiar Contraseña</h2>
              <button className="close-btn" onClick={() => setShowPasswordModal(false)}>✕</button>
            </div>

            <form onSubmit={handlePasswordChange} className="password-form">
              {passwordError && (
                <div className="alert alert-error">
                  ⚠️ {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="alert alert-success">
                  {passwordSuccess}
                </div>
              )}

              <div className="form-group">
                <label>Contraseña Actual</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  required
                  minLength={4}
                />
              </div>

              <div className="form-group">
                <label>Nueva Contraseña</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  required
                  minLength={4}
                />
              </div>

              <div className="form-group">
                <label>Confirmar Nueva Contraseña</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  required
                  minLength={4}
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowPasswordModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit">
                  Guardar Contraseña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeDashboard;
