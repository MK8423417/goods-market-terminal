import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMarketSimulator } from '../hooks/useMarketSimulator';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, Settings, Briefcase, Mail, CheckCircle, MapPin, Clock, DollarSign, Star, TrendingUp, Scale, BellRing, Package, Zap, Lock, Globe, Moon, Sun, MonitorPlay } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SUPPLIERS } from '../data/mockData';

type Tab = 'overview' | 'business' | 'market' | 'alerts' | 'experience' | 'security';

export default function Profile() {
  const { user, logout, updateProfile } = useAuth();
  const { orders, inventory } = useMarketSimulator();
  const { t, locale, toggleLanguage } = useLanguage();
  const { theme, setThemeDirectly } = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isEditing, setIsEditing] = useState(false);
  
  // Consolidate form Data based on UserProfile typing
  const [formData, setFormData] = useState({
    name: user?.name || '',
    businessName: user?.businessName || '',
    businessType: user?.businessType || '',
    taxId: user?.taxId || '',
    deliveryAddress: user?.deliveryAddress || '',
    operatingHours: user?.operatingHours || '',
    monthlyBudgetAlert: user?.monthlyBudgetAlert || 0,
    priceChangeThreshold: user?.priceChangeThreshold || 5, // 5% default
    currency: user?.currency || 'EUR',
    weightUnit: user?.weightUnit || 'kg',
    priceDropNotificationToggle: user?.priceDropNotificationToggle || 'in-app',
    lowInventoryAlerts: user?.lowInventoryAlerts ?? true,
    marketSummary: user?.marketSummary ?? false,
    tickSpeed: user?.tickSpeed || 3000
  });

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSave = () => {
    updateProfile(formData);
    setIsEditing(false);
  };

  const handleToggleFavSupplier = (sId: string) => {
    const favs = user.favoriteSuppliers || [];
    const newFavs = favs.includes(sId) ? favs.filter(id => id !== sId) : [...favs, sId];
    updateProfile({ favoriteSuppliers: newFavs });
  };

  // Quick stats
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, o) => sum + (o.price * o.quantity), 0);
  const itemsInStock = Object.values(inventory).reduce((sum, qty) => sum + qty, 0);

  const renderTabs = () => {
    const tabs: {id: Tab, label: string}[] = [
      { id: 'overview', label: 'Overview' },
      { id: 'business', label: 'Business Config' },
      { id: 'market', label: 'Market Preferences' },
      { id: 'alerts', label: 'Smart Alerts' },
      { id: 'experience', label: 'App Experience' },
      { id: 'security', label: 'Security' }
    ];

    return (
      <div className="pill-scroll" style={{ margin: '0 -20px 20px -20px', padding: '0 20px' }}>
        {tabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setIsEditing(false); }}
            className={`pill ${activeTab === tab.id ? 'active' : ''}`}
            style={{ flexShrink: 0 }}
          >
            {t(tab.label)}
          </button>
        ))}
      </div>
    );
  };

  const renderEditToggle = () => (
    <button 
      onClick={() => isEditing ? handleSave() : setIsEditing(true)}
      style={{ float: 'right', background: 'none', border: 'none', color: isEditing ? 'var(--color-up)' : 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
    >
      {isEditing ? <CheckCircle size={18} /> : <Settings size={18} />}
      {isEditing ? t('Save') : t('Edit')}
    </button>
  );

  return (
    <div className="page-content">
      <header style={{ margin: '-20px -20px 20px -20px', paddingBottom: '16px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '1.4rem' }}>{t('Profile')}</h1>
        <button onClick={handleLogout} className="secondary-btn" style={{ width: 'auto', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-down)' }}>
          <LogOut size={16} />
          {t('Sign Out')}
        </button>
      </header>

      {renderTabs()}

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '32px', background: 'var(--color-up)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.5rem', fontWeight: 'bold' }}>
                  {(user.name || user.businessName).charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{user.name || user.businessName}</h2>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                    <Mail size={14} /> {user.email}
                  </div>
                </div>
              </div>
            </div>

            <h3 style={{ fontSize: '1.1rem', marginTop: '10px' }}>{t('Account Overview')}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
              <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-up)' }} className="mono-nums">{totalOrders}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{t('Total Orders')}</div>
              </div>
              <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)' }} className="mono-nums">{totalSpent.toFixed(2)}{user.currency === 'USD' ? '$' : '€'}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{t('Total Spent')}</div>
              </div>
              <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)' }} className="mono-nums">{itemsInStock}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{t('Items in Stock')}</div>
              </div>
            </div>
          </div>
        )}

        {/* BUSINESS CONFIG TAB */}
        {activeTab === 'business' && (
          <div className="card">
            <div style={{ marginBottom: '16px' }}>
              {renderEditToggle()}
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{t('Business Config')}</h3>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{t('Business Name')}</label>
                {isEditing ? <input className="search-bar" value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} style={{ padding: '8px 12px' }}/> : <div style={{ fontWeight: 500 }}><Briefcase size={16} style={{ verticalAlign: 'text-bottom', marginRight: '8px', color: 'var(--text-secondary)' }}/>{user.businessName}</div>}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{t('Tax ID / CIF')}</label>
                {isEditing ? <input className="search-bar" value={formData.taxId} onChange={e => setFormData({...formData, taxId: e.target.value})} style={{ padding: '8px 12px' }} placeholder="ES-B12345678"/> : <div style={{ fontWeight: 500 }}>{user.taxId || <span style={{color: 'var(--text-secondary)'}}>Not set</span>}</div>}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{t('Delivery Address')}</label>
                {isEditing ? <input className="search-bar" value={formData.deliveryAddress} onChange={e => setFormData({...formData, deliveryAddress: e.target.value})} style={{ padding: '8px 12px' }} placeholder="Calle Principal 123..."/> : <div style={{ fontWeight: 500 }}><MapPin size={16} style={{ verticalAlign: 'text-bottom', marginRight: '8px', color: 'var(--text-secondary)' }}/>{user.deliveryAddress || <span style={{color: 'var(--text-secondary)'}}>Not set</span>}</div>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{t('Operating Hours')}</label>
                  {isEditing ? <input className="search-bar" value={formData.operatingHours} onChange={e => setFormData({...formData, operatingHours: e.target.value})} style={{ padding: '8px 12px' }} placeholder="09:00 - 18:00"/> : <div style={{ fontWeight: 500 }}><Clock size={16} style={{ verticalAlign: 'text-bottom', marginRight: '8px', color: 'var(--text-secondary)' }}/>{user.operatingHours || <span style={{color: 'var(--text-secondary)'}}>Not set</span>}</div>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{t('Monthly Budget Alert')}</label>
                  {isEditing ? <input type="number" className="search-bar" value={formData.monthlyBudgetAlert} onChange={e => setFormData({...formData, monthlyBudgetAlert: Number(e.target.value)})} style={{ padding: '8px 12px' }} /> : <div style={{ fontWeight: 500 }}><DollarSign size={16} style={{ verticalAlign: 'text-bottom', marginRight: '8px', color: 'var(--text-secondary)' }}/>{user.monthlyBudgetAlert ? `${user.monthlyBudgetAlert} ${user.currency || 'EUR'}` : <span style={{color: 'var(--text-secondary)'}}>Off</span>}</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MARKET PREFERENCES TAB */}
        {activeTab === 'market' && (
          <div style={{ display: 'grid', gap: '16px' }}>
            <div className="card">
               <div style={{ marginBottom: '16px' }}>
                {renderEditToggle()}
                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{t('Market Preferences')}</h3>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{t('Price Change Threshold (%)')}</label>
                  {isEditing ? <input type="number" className="search-bar" value={formData.priceChangeThreshold} onChange={e => setFormData({...formData, priceChangeThreshold: Number(e.target.value)})} style={{ padding: '8px 12px' }} /> : <div style={{ fontWeight: 500 }}><TrendingUp size={16} style={{ verticalAlign: 'text-bottom', marginRight: '8px', color: 'var(--text-secondary)' }}/>{user.priceChangeThreshold || 5}%</div>}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{t('Currency & Weight Unit')}</label>
                  {isEditing ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select className="search-bar" value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})} style={{ padding: '8px' }}>
                        <option value="EUR">EUR (€)</option><option value="USD">USD ($)</option>
                      </select>
                      <select className="search-bar" value={formData.weightUnit} onChange={e => setFormData({...formData, weightUnit: e.target.value})} style={{ padding: '8px' }}>
                        <option value="kg">kg</option><option value="lb">lb</option>
                      </select>
                    </div>
                  ) : <div style={{ fontWeight: 500 }}><Scale size={16} style={{ verticalAlign: 'text-bottom', marginRight: '8px', color: 'var(--text-secondary)' }}/>{user.currency || 'EUR'} / {user.weightUnit || 'kg'}</div>}
                </div>
              </div>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '1.1rem', margin: '0 0 16px 0' }}>{t('Favorite Suppliers')}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>Select suppliers to prioritize their active stock listings in your searches.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
                {Object.entries(SUPPLIERS).map(([sId, supplier]) => {
                  const isFav = user.favoriteSuppliers?.includes(sId);
                  return (
                    <button 
                      key={sId}
                      onClick={() => handleToggleFavSupplier(sId)}
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        border: `1px solid ${isFav ? 'var(--color-up)' : 'var(--border-color)'}`,
                        background: isFav ? 'var(--color-up)11' : 'var(--bg-secondary)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <img src={supplier.logo} style={{ width: '24px', height: '24px', borderRadius: '4px' }} alt={supplier.name} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: isFav ? 'var(--color-up)' : 'var(--text-primary)' }}>{supplier.name}</span>
                      {isFav && <Star size={14} fill="var(--color-up)" color="var(--color-up)" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SMART ALERTS TAB */}
        {activeTab === 'alerts' && (
          <div className="card">
            <div style={{ marginBottom: '16px' }}>
              {renderEditToggle()}
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{t('Smart Alerts & Notifications')}</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <BellRing size={20} color="var(--text-secondary)" />
                  <div>
                    <div style={{ fontWeight: 600 }}>{t('Price Drop Notifications')}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>How should we reach you for limit orders?</div>
                  </div>
                </div>
                {isEditing ? (
                  <select className="search-bar" value={formData.priceDropNotificationToggle} onChange={e => setFormData({...formData, priceDropNotificationToggle: e.target.value})} style={{ width: 'auto', padding: '8px 12px' }}>
                    <option value="in-app">In-App Only</option>
                    <option value="email">Email</option>
                  </select>
                ) : (
                  <div className="pill" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                    {user.priceDropNotificationToggle === 'email' ? 'Email' : 'In-App Only'}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Package size={20} color="var(--text-secondary)" />
                  <div>
                    <div style={{ fontWeight: 600 }}>{t('Low Inventory Warnings')}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Alert me when warehouse stock enters danger levels.</div>
                  </div>
                </div>
                {isEditing ? (
                   <input type="checkbox" checked={formData.lowInventoryAlerts} onChange={e => setFormData({...formData, lowInventoryAlerts: e.target.checked})} style={{ width: '20px', height: '20px' }} />
                ) : (
                  <div className="pill" style={{ background: user.lowInventoryAlerts ? 'var(--color-up)22' : 'var(--bg-secondary)', color: user.lowInventoryAlerts ? 'var(--color-up)' : 'var(--text-secondary)' }}>
                    {user.lowInventoryAlerts ? 'Enabled' : 'Disabled'}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Zap size={20} color="var(--text-secondary)" />
                  <div>
                    <div style={{ fontWeight: 600 }}>{t('Daily Market Summary')}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Receive a morning report of volatile assets.</div>
                  </div>
                </div>
                {isEditing ? (
                   <input type="checkbox" checked={formData.marketSummary} onChange={e => setFormData({...formData, marketSummary: e.target.checked})} style={{ width: '20px', height: '20px' }} />
                ) : (
                  <div className="pill" style={{ background: user.marketSummary ? 'var(--color-up)22' : 'var(--bg-secondary)', color: user.marketSummary ? 'var(--color-up)' : 'var(--text-secondary)' }}>
                    {user.marketSummary ? 'Enabled' : 'Disabled'}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* APP EXPERIENCE TAB */}
        {activeTab === 'experience' && (
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', margin: '0 0 20px 0' }}>{t('App Experience')}</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Theme */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {theme === 'dark' ? <Moon size={20} color="var(--text-secondary)" /> : <Sun size={20} color="var(--text-secondary)" />}
                  <div>
                    <div style={{ fontWeight: 600 }}>{t('Interface Theme')}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Choose dark or light mode.</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setThemeDirectly('light')} className="pill" style={{ background: theme === 'light' ? 'var(--text-primary)' : 'var(--bg-secondary)', color: theme === 'light' ? 'var(--bg-color)' : 'var(--text-primary)' }}>Light</button>
                  <button onClick={() => setThemeDirectly('dark')} className="pill" style={{ background: theme === 'dark' ? 'var(--text-primary)' : 'var(--bg-secondary)', color: theme === 'dark' ? 'var(--bg-color)' : 'var(--text-primary)' }}>Dark</button>
                </div>
              </div>

              {/* Language */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Globe size={20} color="var(--text-secondary)" />
                  <div>
                    <div style={{ fontWeight: 600 }}>{t('Terminal Language')}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Supported: EN, ES.</div>
                  </div>
                </div>
                <button onClick={toggleLanguage} className="secondary-btn" style={{ width: 'auto', padding: '8px 16px', fontWeight: 'bold' }}>
                  {locale.toUpperCase()} (Switch)
                </button>
              </div>

              {/* Sim Speed */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <MonitorPlay size={20} color="var(--text-secondary)" />
                  <div>
                    <div style={{ fontWeight: 600 }}>{t('Simulator Tick Speed')}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Adjust the velocity of the simulated market algorithm.</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.tickSpeed ? (user.tickSpeed / 1000).toFixed(1) : '3.0'} sec</span>
                  <input 
                    type="range" 
                    min="500" 
                    max="10000" 
                    step="500" 
                    value={user.tickSpeed || 3000} 
                    onChange={(e) => updateProfile({ tickSpeed: Number(e.target.value) })}
                    style={{ width: '120px' }}
                  />
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SECURITY TAB */}
        {activeTab === 'security' && (
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', margin: '0 0 20px 0' }}>{t('Security')}</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '12px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
                <Lock size={20} color="var(--text-secondary)" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{t('Change Password')}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>Update your simulated terminal credentials.</div>
                  <input type="password" placeholder="New Password" className="search-bar" style={{ marginBottom: '8px' }} />
                  <input type="password" placeholder="Confirm Password" className="search-bar" style={{ marginBottom: '8px' }} />
                  <button className="secondary-btn" style={{ width: 'auto', padding: '8px 16px' }}>Update (Simulated)</button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <LogOut size={20} color="var(--color-down)" />
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--color-down)' }}>{t('Active Sessions')}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Log out from all other devices.</div>
                  </div>
                </div>
                 <button className="secondary-btn" style={{ width: 'auto', padding: '8px 16px', color: 'var(--color-down)' }}>Force Logout</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
