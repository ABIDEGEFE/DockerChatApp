import { Route, Routes, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import Register from './pages/Register';
import Groups from './pages/Groups';
import Chat from './pages/Chat';
import { logout } from './api';

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const hideChrome = location.pathname === '/login' || location.pathname === '/register';

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      // ignore errors for demo logout
    }
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <div className="app-shell">
      {!hideChrome && (
        <header className="app-header">
          <nav>
            <Link to="/groups">Groups</Link>
            <button type="button" onClick={handleLogout}>Logout</button>
          </nav>
        </header>
      )}
      <div className="app-content">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/chat/:groupId" element={<Chat />} />
        </Routes>
      </div>
    </div>
  );
}
