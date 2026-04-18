import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Home, LineChart, LayoutList, Bell, Globe, Moon, Sun, Store } from 'lucide-react';
import Watchlist from './pages/Watchlist';
import ProductDetail from './pages/ProductDetail';
import Orders from './pages/Orders';
import Alerts from './pages/Alerts';
import MyBusiness from './pages/MyBusiness';
import { LanguageProvider, useLanguage } from './context/LanguageContext';

function GlobalControls({ theme, toggleTheme }: { theme: 'light'|'dark', toggleTheme: () => void }) {
  const { locale, toggleLanguage } = useLanguage();
  const location = useLocation();

  if (location.pathname !== '/') return null;

  return (
    <div style={{ position: 'fixed', top: '16px', right: '16px', display: 'flex', gap: '8px', zIndex: 1000 }}>
      <button onClick={toggleTheme} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-primary)', padding: 0 }}>
        {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
      </button>
      <button onClick={toggleLanguage} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '0.75rem', fontWeight: 'bold', padding: 0 }}>
        {locale.toUpperCase()}
      </button>
    </div>
  );
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
    </nav>
  );
}

function AppContent() {
  const [theme, setTheme] = useState<'light'|'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme as any);
    if (savedTheme === 'dark') document.documentElement.classList.add('dark');
  }, []);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', next);
      if (next === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      return next;
    });
  };

  return (
    <Router>
      <div className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/" element={<Watchlist />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/business" element={<MyBusiness />} />
        </Routes>
        <Navigation />
        <GlobalControls theme={theme} toggleTheme={toggleTheme} />
      </div>
    </Router>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
