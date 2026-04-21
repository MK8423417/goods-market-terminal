import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMarketSimulator } from '../hooks/useMarketSimulator';
import { SUPPLIERS } from '../data/mockData';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { 
  ChevronLeft as LucideChevronLeft, 
  Bell as LucideBell, 
  CheckCircle as LucideCheckCircle, 
  Eye as LucideEye, 
  EyeOff as LucideEyeOff,
  ExternalLink as LucideExternalLink
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { market, activeProducts, alerts, placeOrder, addAlert, removeAlert } = useMarketSimulator();
  const { t } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  
  const currencySymbol = user?.currency === 'USD' ? '$' : '€';

  
  const product = useMemo(() => activeProducts.find(p => p.id === id), [activeProducts, id]);
  
  const displayName = product ? (product.displayName || t(product.name)) : '';
  const realThumbnail = product?.realThumbnail || null;
  
  const history = useMemo(() => (id ? market[id] : []) || [], [market, id]);
  
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [showOrderPanel, setShowOrderPanel] = useState(false);
  
  const [showAlertPanel, setShowAlertPanel] = useState(false);
  const [alertTargetPriceStr, setAlertTargetPriceStr] = useState<string>('');
  const [alertSuccess, setAlertSuccess] = useState(false);

  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [selectedPrice, setSelectedPrice] = useState<number>(0);

  const [timeframe, setTimeframe] = useState<'1d'|'1w'|'1m'|'1y'>('1m');
  const isRealMode = user?.marketMode === 'real';
  const [visibleSuppliers, setVisibleSuppliers] = useState<Set<string>>(new Set(['mercadona']));
  const [hoveredSupplierId, setHoveredSupplierId] = useState<string | null>(null);
  const [chartMode, setChartMode] = useState<'all' | 'lowest'>('all');
  const [selectedSubTab, setSelectedSubTab] = useState<'comparison' | 'details'>('comparison');
  const quantityInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRealMode) {
      setVisibleSuppliers(new Set(['mercadona']));
    } else {
      setVisibleSuppliers(new Set(Object.keys(SUPPLIERS)));
    }
  }, [isRealMode]);

  useEffect(() => {
    if (showOrderPanel && quantityInputRef.current) {
      quantityInputRef.current.focus();
      quantityInputRef.current.select();
    }
  }, [showOrderPanel]);

  if (!product) {
    return (
      <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>{t('Loading product data...')}</div>
          <button className="secondary-btn" onClick={() => navigate(-1)} style={{ width: 'auto' }}>{t('Go Back')}</button>
        </div>
      </div>
    );
  }

  const currentPoint: any = history[history.length - 1] || {};
  
  // Find lowest price
  let lowestPrice = Infinity;
  let lowestSupplierId = '';
  let providerCurrentPrices: Record<string, number> = {};

  const effectiveSupplierIds = isRealMode ? new Set(['mercadona']) : new Set(Object.keys(SUPPLIERS));

  Object.keys(SUPPLIERS).forEach(sId => {
    if (effectiveSupplierIds.has(sId)) {
      const price = currentPoint[sId];
      if (price !== undefined && price !== null) {
        providerCurrentPrices[sId] = price;
        if (price < lowestPrice) {
          lowestPrice = price;
          lowestSupplierId = sId;
        }
      }
    }
  });

  if (lowestPrice === Infinity) {
    lowestPrice = product.basePrice;
    providerCurrentPrices.mercadona = product.basePrice;
    lowestSupplierId = 'mercadona';
  }
  const lowestSupplier = SUPPLIERS[lowestSupplierId] || SUPPLIERS.mercadona;
  
  // Calculate timeframe bounds
  const now = Date.now();
  let timeLimit = now - (24 * 60 * 60 * 1000); // Default 1d
  if (timeframe === '1w') timeLimit = now - (7 * 24 * 60 * 60 * 1000);
  else if (timeframe === '1m') timeLimit = now - (30 * 24 * 60 * 60 * 1000);
  else if (timeframe === '1y') timeLimit = now - (365 * 24 * 60 * 60 * 1000);

  const chartData = history.filter((h: any) => h.time >= timeLimit).map((h: any) => {
    const point: any = { timestamp: h.time };
    let lowestAtPoint = Infinity;
    Object.keys(SUPPLIERS).forEach(s => {
      if (effectiveSupplierIds.has(s) && h[s] !== undefined && h[s] !== null) {
        point[s] = h[s];
        if (h[s] < lowestAtPoint) lowestAtPoint = h[s];
      }
    });
    point['lowest'] = lowestAtPoint === Infinity ? product.basePrice : lowestAtPoint;
    return point;
  });

  // If no authentic chart data exists yet, show a single baseline point
  if (chartData.length === 0) {
    chartData.push({
      timestamp: now,
      mercadona: product.basePrice,
      lowest: product.basePrice
    });
  }

  const formatXAxis = (tickItem: number) => {
    const d = new Date(tickItem);
    if (timeframe === '1d') return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
  };

  const toggleSupplierVisibility = (sId: string, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    setVisibleSuppliers(prev => {
      const next = new Set(prev);
      const allIds = isRealMode ? ['mercadona'] : Object.keys(SUPPLIERS);
      if (next.has(sId)) {
        if (next.size > 1) next.delete(sId);
        else return new Set(allIds);
      } else {
        next.add(sId);
      }
      return next;
    });
  };



  const handleBuy = async () => {
    if (!isAuthenticated) { navigate('/auth'); return; }
    await placeOrder(product.id, selectedSupplierId || lowestSupplierId, orderQuantity, selectedPrice || lowestPrice, 0, displayName);
    setOrderSuccess(true);
    setTimeout(() => {
      setOrderSuccess(false);
      setShowOrderPanel(false);
    }, 2500);
  };

  const openAlertPanel = () => {
    if (!isAuthenticated) { navigate('/auth'); return; }
    setAlertTargetPriceStr((lowestPrice * 0.95).toFixed(2));
    setShowAlertPanel(true);
    setShowOrderPanel(false);
    setAlertSuccess(false);
  };

  const handleCreateAlert = async () => {
    await addAlert(product.id, Number(alertTargetPriceStr));
    setAlertSuccess(true);
    setTimeout(() => {
      setAlertSuccess(false);
      setShowAlertPanel(false);
    }, 2500);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const actualPrices = payload.filter((p: any) => p.dataKey !== 'lowest' && typeof p.value === 'number');
      if (actualPrices.length === 0) return null;

      const sorted = [...actualPrices].sort((a, b) => (a.value as number) - (b.value as number));
      const min = sorted[0];
      const max = sorted[sorted.length - 1];
      
      const values = sorted.map(s => s.value as number);
      const mid = Math.floor(values.length / 2);
      const median = values.length % 2 === 0 ? (values[mid - 1] + values[mid]) / 2 : values[mid];

      return (
        <div className="card" style={{ 
          padding: '12px', fontSize: '0.8rem', minWidth: '160px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          border: '1px solid var(--border-color)', background: 'var(--bg-color)', opacity: 0.95
        }}>
          <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
            {new Date(label).toLocaleString([], { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ color: max.color, fontWeight: 'bold' }}>{t('High')}:</span>
            <span className="mono-nums">{max.value.toFixed(2)}{currencySymbol}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ color: min.color, fontWeight: 'bold' }}>{t('Low')}:</span>
            <span className="mono-nums">{min.value.toFixed(2)}{currencySymbol}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', borderTop: '1px solid var(--border-color)', paddingTop: '4px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{t('Median')}:</span>
            <span className="mono-nums" style={{ fontWeight: 'bold' }}>{median.toFixed(2)}{currencySymbol}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="page-content" style={{ paddingBottom: '120px' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '-20px -20px 20px -20px', padding: '16px 20px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ 
            display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--bg-color)', 
            border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '8px', 
            cursor: 'pointer', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 500
          }}
        >
          <LucideChevronLeft size={18} />
          {t('Go Back')}
        </button>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
          {realThumbnail ? (
            <img src={realThumbnail} alt="" style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#fff', padding: '2px' }} />
          ) : (
            <span style={{ fontSize: '1.4rem' }}>{product.icon}</span>
          )}
          <h1 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 700 }}>{displayName}</h1>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={openAlertPanel} style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <LucideBell size={20} />
          </button>
        </div>
      </header>

      {/* Main Price */}
      <div style={{ textAlign: 'center', margin: '20px 0 40px' }}>
        <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t('Lowest at')}</span>
          <span className="supplier-chip" style={{ background: lowestSupplier.color, color: '#fff', fontSize: '0.75rem', padding: '2px 8px' }}>{lowestSupplier.name}</span>
        </div>
        <div className="mono-nums" style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          {lowestPrice.toFixed(2)}
          <span style={{ fontSize: '1.8rem', color: 'var(--text-secondary)', marginLeft: '4px' }}>{currencySymbol}</span>
        </div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>{t('per unit')} ({product.unitSize || '1'}{product.sizeFormat || product.unit})</div>
      </div>

      {/* Chart Section */}
      <div className="card" style={{ padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '12px' }}>
            {['1d', '1w', '1m', '1y'].map(tf => (
              <button 
                key={tf} 
                onClick={() => setTimeframe(tf as any)}
                style={{ 
                  background: timeframe === tf ? 'var(--bg-color)' : 'transparent',
                  color: timeframe === tf ? 'var(--text-primary)' : 'var(--text-secondary)',
                  border: 'none', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', borderRadius: '8px', textTransform: 'uppercase'
                }}
              >
                {tf}
              </button>
            ))}
          </div>
          
          <div style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: '12px', padding: '4px' }}>
            <button 
              onClick={() => setChartMode('all')}
              style={{ 
                background: chartMode === 'all' ? 'var(--bg-color)' : 'transparent',
                color: chartMode === 'all' ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer'
              }}
            >
              {t('Compare')}
            </button>
            {!isRealMode && (
              <button 
                onClick={() => setChartMode('lowest')}
                style={{ 
                  background: chartMode === 'lowest' ? 'var(--bg-color)' : 'transparent',
                  color: chartMode === 'lowest' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer'
                }}
              >
                {t('Trend')}
              </button>
            )}
          </div>
        </div>

        <div style={{ height: '300px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" opacity={0.5} />
              <XAxis dataKey="timestamp" type="number" domain={['dataMin', 'dataMax']} tickFormatter={formatXAxis} hide />
              <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{fontSize: 10, fill: 'var(--text-secondary)'}} />
              <Tooltip content={<CustomTooltip />} />
              {chartMode === 'lowest' ? (
                <Line type="monotone" dataKey="lowest" stroke="var(--color-up)" strokeWidth={3} dot={false} isAnimationActive={false} />
              ) : (
                Object.values(SUPPLIERS).map(s => {
                  if (isRealMode && s.id !== 'mercadona') return null;
                  const isVisible = visibleSuppliers.has(s.id);
                  const isHovered = hoveredSupplierId === s.id;
                  return (
                    <Line 
                      key={s.id} type="monotone" dataKey={s.id} name={s.name} stroke={s.color} 
                      strokeOpacity={isVisible ? 1 : 0.15} strokeWidth={isHovered ? 4 : (isVisible ? 2.5 : 1)} 
                      dot={false} isAnimationActive={false} 
                    />
                  );
                })
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Constraints & Alerts */}
      {alerts.filter(a => a.productId === product.id).length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '1.2rem', fontWeight: 700 }}>{t('Active Alerts')}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {alerts.filter(a => a.productId === product.id).map(al => (
              <div key={al.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderColor: 'var(--color-up)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: 'rgba(var(--color-up-rgb), 0.1)', padding: '8px', borderRadius: '50%' }}>
                    <LucideBell size={20} color="var(--color-up)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{t('Target')}: {al.targetPrice.toFixed(2)}{currencySymbol}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{al.active ? t('Active Now') : t('Paused')}</div>
                  </div>
                </div>
                <button 
                  onClick={() => removeAlert(al.id)} 
                  style={{ background: 'none', border: 'none', color: 'var(--color-down)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}>
                  {t('Remove')}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid var(--border-color)', marginBottom: '32px' }}>
        {['comparison', 'details'].map(tab => (
          <button 
            key={tab}
            onClick={() => setSelectedSubTab(tab as any)}
            style={{ 
              padding: '12px 4px', background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: selectedSubTab === tab ? '3px solid var(--text-primary)' : '3px solid transparent',
              color: selectedSubTab === tab ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: 700, fontSize: '1rem', transition: 'all 0.2s'
            }}
          >
            {tab === 'comparison' ? t('Market Prices') : t('Specs')}
          </button>
        ))}
      </div>

      {selectedSubTab === 'comparison' ? (
        <div style={{ marginBottom: '40px' }}>
          <div style={{ background: 'var(--bg-color)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            {Object.values(SUPPLIERS)
              .filter(s => !isRealMode || s.id === 'mercadona')
              .sort((a, b) => (providerCurrentPrices[a.id] || Infinity) - (providerCurrentPrices[b.id] || Infinity))
              .map((s, idx, arr) => {
                const pPrice = providerCurrentPrices[s.id];
                if (pPrice === undefined) return null;
                const isSelected = visibleSuppliers.has(s.id);
                return (
                  <div 
                    key={s.id} 
                    onMouseEnter={() => setHoveredSupplierId(s.id)}
                    onMouseLeave={() => setHoveredSupplierId(null)}
                    onClick={() => toggleSupplierVisibility(s.id)}
                    style={{ 
                      display: 'flex', justifyContent: 'space-between', padding: '20px', 
                      borderBottom: idx < arr.length - 1 ? '1px solid var(--border-color)' : 'none',
                      background: isSelected ? 'rgba(var(--color-up-rgb), 0.05)' : 'transparent',
                      cursor: 'pointer', transition: 'all 0.2s', opacity: isSelected ? 1 : 0.5
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                      <div style={{ color: isSelected ? 'var(--color-up)' : 'var(--text-secondary)' }}>
                        {isSelected ? <LucideEye size={20} /> : <LucideEyeOff size={20} />}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {s.logo ? (
                          <img src={s.logo} alt="" style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#fff', padding: '2px' }} />
                        ) : (
                          <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: s.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{s.name[0]}</div>
                        )}
                        <span style={{ fontWeight: 600 }}>{s.name}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div className="mono-nums" style={{ fontWeight: 700, fontSize: '1.1rem' }}>{pPrice.toFixed(2)}{currencySymbol}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t('Available')}</div>
                      </div>
                      <button 
                        className="secondary-btn" 
                        style={{ padding: '8px 16px', fontSize: '0.85rem', width: 'auto' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isAuthenticated) { navigate('/auth'); return; }
                          setSelectedSupplierId(s.id);
                          setSelectedPrice(pPrice);
                          setShowOrderPanel(true);
                        }}
                      >
                        {t('Buy')}
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: '24px', marginBottom: '40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>{t('Category')}</div>
              <div style={{ fontWeight: 600 }}>{t(product.category)}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>{t('Packaging')}</div>
              <div style={{ fontWeight: 600 }}>{product.unitSize} {product.sizeFormat || product.unit}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>{t('ID')}</div>
              <div style={{ fontWeight: 400, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{product.id}</div>
            </div>
          </div>

          {product.shareUrl && (
            <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LucideExternalLink size={18} color="var(--color-up)" />
                {t('External Integration')}
              </div>
              <div className="card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>{t('Mercadona Web Store')}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t('View real-time stock and full product description')}</div>
                </div>
                <a 
                  href={product.shareUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    background: 'var(--color-up)', border: 'none', borderRadius: '8px', 
                    padding: '10px 20px', cursor: 'pointer', color: '#fff', 
                    display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', 
                    fontSize: '0.85rem', fontWeight: 600, transition: 'transform 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {t('Open Web Page')}
                  <LucideExternalLink size={14} />
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Buy Floating Tab */}
      <div style={{ position: 'fixed', bottom: '80px', left: 0, width: '100%', padding: '0 20px', zIndex: 100 }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          {!showOrderPanel && !showAlertPanel && (
            <button className="buy-btn" onClick={() => {
              if (!isAuthenticated) { navigate('/auth'); return; }
              setSelectedSupplierId(lowestSupplierId);
              setSelectedPrice(lowestPrice);
              setShowOrderPanel(true);
            }} style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
              {t('Buy at')} {lowestPrice.toFixed(2)}{currencySymbol}
            </button>
          )}

          {showOrderPanel && (
            <div className="card" style={{ padding: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', border: '1px solid var(--border-color)' }}>
              {orderSuccess ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <LucideCheckCircle size={48} color="var(--color-up)" style={{ margin: '0 auto 16px' }} />
                  <h3 style={{ marginBottom: '8px' }}>{t('Order Successful')}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t('Inventory updated.')}</p>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <div style={{ fontWeight: 600 }}>{t('Quantity')}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <button onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', cursor: 'pointer', color: 'var(--text-primary)' }}>-</button>
                      <input 
                        ref={quantityInputRef} type="number" value={orderQuantity} 
                        onChange={(e) => setOrderQuantity(Math.max(1, Number(e.target.value) || 1))}
                        style={{ width: '60px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 700, background: 'transparent', border: 'none', color: 'var(--text-primary)' }} 
                      />
                      <button onClick={() => setOrderQuantity(orderQuantity + 1)} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', cursor: 'pointer', color: 'var(--text-primary)' }}>+</button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{t('Total')}</div>
                    <div className="mono-nums" style={{ fontSize: '1.5rem', fontWeight: 800 }}>{((selectedPrice || lowestPrice) * orderQuantity).toFixed(2)}{currencySymbol}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="secondary-btn" onClick={() => setShowOrderPanel(false)}>{t('Cancel')}</button>
                    <button className="buy-btn" onClick={handleBuy}>{t('Place Order')}</button>
                  </div>
                </>
              )}
            </div>
          )}

          {showAlertPanel && (
            <div className="card" style={{ padding: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', border: '1px solid var(--border-color)' }}>
              {alertSuccess ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <LucideCheckCircle size={48} color="var(--color-up)" style={{ margin: '0 auto 16px' }} />
                  <h3 style={{ marginBottom: '8px' }}>{t('Alert Created')}</h3>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ fontWeight: 600, marginBottom: '16px' }}>{t('Price Target')}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <input 
                        type="range" min={lowestPrice * 0.5} max={lowestPrice} step="0.05"
                        value={Number(alertTargetPriceStr) || 0}
                        onChange={(e) => setAlertTargetPriceStr(e.target.value)}
                        style={{ flex: 1 }}
                      />
                      <div className="mono-nums" style={{ fontSize: '1.2rem', fontWeight: 700, width: '100px', textAlign: 'right' }}>
                        {Number(alertTargetPriceStr).toFixed(2)}{currencySymbol}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="secondary-btn" onClick={() => setShowAlertPanel(false)}>{t('Cancel')}</button>
                    <button className="buy-btn" onClick={handleCreateAlert}>{t('Enable Alert')}</button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
