import { NavLink, useLocation, Navigate, BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home, LayoutList, Bell, Store, User } from 'lucide-react';
import Watchlist from './pages/Watchlist';
import ProductDetail from './pages/ProductDetail';
import Orders from './pages/Orders';
import Alerts from './pages/Alerts';
import MyBusiness from './pages/MyBusiness';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';



function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function Navigation() {
  const { t } = useLanguage();
  return (
    <nav className="bottom-nav">
      <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Home size={22} />
        <span>{t('Watchlist')}</span>
      </NavLink>
      <NavLink to="/orders" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <LayoutList size={22} />
        <span>{t('Orders')}</span>
      </NavLink>
      <NavLink to="/alerts" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Bell size={22} />
        <span>{t('Alerts')}</span>
      </NavLink>
      <NavLink to="/business" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Store size={22} />
        <span>{t('Business')}</span>
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <User size={22} />
        <span>{t('Profile')}</span>
      </NavLink>
    </nav>
  );
}

function AppContent() {
  return (
    <Router>
      <div className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/" element={<Watchlist />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
          <Route path="/business" element={<ProtectedRoute><MyBusiness /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
        <Navigation />
      </div>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
