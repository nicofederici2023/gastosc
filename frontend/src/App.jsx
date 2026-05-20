import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Home, Users, UserCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import GroupDetail from './pages/GroupDetail';
import Profile from './pages/Profile';
import InstallPrompt from './components/InstallPrompt';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const BottomNav = () => {
  const location = useLocation();
  
  return (
    <nav className="bottom-nav">
      <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
        <Home size={24} />
        <span>Inicio</span>
      </Link>
      <Link to="/profile" className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`}>
        <UserCircle size={24} />
        <span>Perfil</span>
      </Link>
    </nav>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <div className="content">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/group/:id" element={<ProtectedRoute><GroupDetail /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            </Routes>
          </div>
          
          <Routes>
            <Route path="/login" element={null} />
            <Route path="*" element={<BottomNav />} />
          </Routes>
          
          <InstallPrompt />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
