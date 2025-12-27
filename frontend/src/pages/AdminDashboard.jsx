import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Employees from '../components/admin/Employees';
import Stores from '../components/admin/Stores';
import Punches from '../components/admin/Punches';
import Dashboard from '../components/admin/Dashboard';
import '../styles/AdminDashboard.css';

function AdminDashboard({ user, onLogout }) {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>👨‍💼 Panel Admin</h2>
          <p className="user-name">{user.name}</p>
        </div>

        <nav className="sidebar-nav">
          <Link 
            to="/admin" 
            className={isActive('/admin') && location.pathname === '/admin' ? 'nav-item active' : 'nav-item'}
          >
            📊 Dashboard
          </Link>
          <Link 
            to="/admin/employees" 
            className={isActive('/admin/employees') ? 'nav-item active' : 'nav-item'}
          >
            👥 Empleados
          </Link>
          <Link 
            to="/admin/stores" 
            className={isActive('/admin/stores') ? 'nav-item active' : 'nav-item'}
          >
            🏪 Tiendas
          </Link>
          <Link 
            to="/admin/punches" 
            className={isActive('/admin/punches') ? 'nav-item active' : 'nav-item'}
          >
            🕐 Ponches
          </Link>
        </nav>

        <button onClick={onLogout} className="logout-button">
          🚪 Cerrar Sesión
        </button>
      </aside>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/stores" element={<Stores />} />
          <Route path="/punches" element={<Punches />} />
        </Routes>
      </main>
    </div>
  );
}

export default AdminDashboard;
