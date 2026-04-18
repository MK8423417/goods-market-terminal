import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMarketSimulator } from '../hooks/useMarketSimulator';
import { PRODUCTS, SUPPLIERS } from '../data/mockData';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { default as LucideChevronLeft } from 'lucide-react/dist/esm/icons/chevron-left';
import { default as LucideBell } from 'lucide-react/dist/esm/icons/bell';
import { default as LucideCheckCircle } from 'lucide-react/dist/esm/icons/check-circle';
import { default as LucideEye } from 'lucide-react/dist/esm/icons/eye';
import { default as LucideEyeOff } from 'lucide-react/dist/esm/icons/eye-off';
import { useLanguage } from '../context/LanguageContext';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { market, alerts, placeOrder, addAlert, removeAlert } = useMarketSimulator();
  const { t } = useLanguage();
  
  const product = PRODUCTS.find(p => p.id === id);
  const history = market[id || ''] || [];
  
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [showOrderPanel, setShowOrderPanel] = useState(false);
  
  const [showAlertPanel, setShowAlertPanel] = useState(false);
  const [alertTargetPriceStr, setAlertTargetPriceStr] = useState<string>('');
  const [alertSuccess, setAlertSuccess] = useState(false);

  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [selectedPrice, setSelectedPrice] = useState<number>(0);

  const [timeframe, setTimeframe] = useState<'1d'|'1w'|'1m'|'1y'>('1m');
  const [visibleSuppliers, setVisibleSuppliers] = useState<Set<string>>(new Set(Object.keys(SUPPLIERS)));
  const [hoveredSupplierId, setHoveredSupplierId] = useState<string | null>(null);
  const [chartMode, setChartMode] = useState<'all' | 'lowest'>('all');
  const quantityInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showOrderPanel && quantityInputRef.current) {
      quantityInputRef.current.focus();
      quantityInputRef.current.select();
    }
  }, [showOrderPanel]);

  if (!product || history.length === 0) return <div style={{ padding: '20px' }}>{t('Loading...')}</div>;

  const currentPoint = history[history.length - 1];
  const yesterdayPoint = history[Math.max(0, history.length - 8)];

  // Find lowest price
  let lowestPrice = Infinity;
  let lowestSupplierId = '';
  let providerCurrentPrices: Record<string, number> = {};

  Object.keys(SUPPLIERS).forEach(sId => {
    providerCurrentPrices[sId] = currentPoint[sId];
    if (currentPoint[sId] < lowestPrice) {
      lowestPrice = currentPoint[sId];
      lowestSupplierId = sId;
    }
  });

  const lowestSupplier = SUPPLIERS[lowestSupplierId];
  
  // Calculate timeframe bounds
  const now = Date.now();
  let timeLimit = now - (24 * 60 * 60 * 1000); // Default 1d
  if (timeframe === '1w') timeLimit = now - (7 * 24 * 60 * 60 * 1000);
  else if (timeframe === '1m') timeLimit = now - (30 * 24 * 60 * 60 * 1000);
  else if (timeframe === '1y') timeLimit = now - (365 * 24 * 60 * 60 * 1000);

  const chartData = history.filter(h => h.time >= timeLimit).map(h => {
    const point: any = { timestamp: h.time };
    let lowestAtPoint = Infinity;
    Object.keys(SUPPLIERS).forEach(s => {
      point[s] = h[s];
      if (h[s] < lowestAtPoint) lowestAtPoint = h[s];
    });
    point['lowest'] = lowestAtPoint;
    return point;
  });

  const formatXAxis = (tickItem: number) => {
    const d = new Date(tickItem);
    if (timeframe === '1d') return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
  };

  const toggleSupplierVisibility = (sId: string) => {
    setVisibleSuppliers(prev => {
      const next = new Set(prev);
      if (next.has(sId)) next.delete(sId);
      else next.add(sId);
      return next;
    });
  };

  const handleBuy = () => {
    // calculate average market price for savings
    const currentPricesArray = Object.values(providerCurrentPrices);
    const avgPrice = currentPricesArray.reduce((acc, v) => acc + v, 0) / currentPricesArray.length;
    const savings = (avgPrice - selectedPrice) * orderQuantity;

    placeOrder({
      productId: product.id,
      productName: product.name,
      supplierId: selectedSupplierId || lowestSupplierId,
      price: selectedPrice || lowestPrice,
      quantity: orderQuantity,
      savings
    });
    setOrderSuccess(true);
    setTimeout(() => {
      setOrderSuccess(false);
      setShowOrderPanel(false);
    }, 2500);
  };

  const openAlertPanel = () => {
    setAlertTargetPriceStr((lowestPrice * 0.95).toFixed(2));
    setShowAlertPanel(true);
    setShowOrderPanel(false);
    setAlertSuccess(false);
  };

  const handleCreateAlert = () => {
    addAlert({
      productId: product.id,
      targetPrice: Number(alertTargetPriceStr) || 0,
      active: true
    });
    setAlertSuccess(true);
    setTimeout(() => {
      setAlertSuccess(false);
      setShowAlertPanel(false);
    }, 2500);
  };

    const CustomTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        // Filter out the 'lowest' trend line data if it exists in payload
        const actualPrices = payload.filter((p: any) => p.dataKey !== 'lowest' && typeof p.value === 'number');
        if (actualPrices.length === 0) return null;

        const sorted = [...actualPrices].sort((a, b) => (a.value as number) - (b.value as number));
        const min = sorted[0];
        const max = sorted[sorted.length - 1];
        
        // Calculate median
        const values = sorted.map(s => s.value as number);
        let median = 0;
        const mid = Math.floor(values.length / 2);
        if (values.length % 2 === 0) {
          median = (values[mid - 1] + values[mid]) / 2;
        } else {
          median = values[mid];
        }

        return (
          <div className="card" style={{ 
            padding: '12px', 
            fontSize: '0.8rem', 
            minWidth: '160px', 
            boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-color)',
            opacity: 0.95
          }}>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', borderBottom: '1px solid var(--border-color)', pb: '4px' }}>
              {new Date(label).toLocaleString([], { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: max.color, fontWeight: 'bold' }}>High:</span>
              <span className="mono-nums">{max.value.toFixed(2)}€ ({max.name})</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: min.color, fontWeight: 'bold' }}>Low:</span>
              <span className="mono-nums">{min.value.toFixed(2)}€ ({min.name})</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', mt: '4px', borderTop: '1px solid var(--border-color)', pt: '4px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Median:</span>
              <span className="mono-nums" style={{ fontWeight: 'bold' }}>{median.toFixed(2)}€</span>
            </div>
          </div>
        );
      }
      return null;
    };

    return (
      <div className="page-content" style={{ paddingBottom: '120px' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '-20px -20px 20px -20px', padding: '16px 20px' }}>
          <button 
            onClick={() => navigate(-1)} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px', 
              background: 'var(--bg-secondary)', 
              border: '1px solid var(--border-color)', 
              padding: '6px 10px', 
              borderRadius: '8px', 
              cursor: 'pointer',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              fontWeight: 500
            }}
          >
            <LucideChevronLeft size={18} />
            {t('Go Back')}
          </button>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.2rem' }}>{product.icon}</span>
            <h1 style={{ fontSize: '1.1rem' }}>{t(product.name)}</h1>
          </div>
          <button onClick={openAlertPanel} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <LucideBell size={20} color="var(--text-secondary)" />
          </button>
        </header>
  
        {/* Main Price */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{t('Lowest at')}</span>
            <span className="supplier-chip" style={{ background: lowestSupplier.color }}>{lowestSupplier.name}</span>
          </div>
          <div className="mono-nums price-tick-down" style={{ fontSize: '3.5rem', fontWeight: 'bold' }}>
            {lowestPrice.toFixed(2)}
            <span style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', marginLeft: '4px' }}>€</span>
          </div>
          <div style={{ color: 'var(--text-secondary)' }}>{t('per ')}{product.unit}</div>
        </div>
  
        {/* Chart Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div className="pill-scroll" style={{ margin: 0, padding: 0 }}>
            {['1d', '1w', '1m', '1y'].map(tf => (
              <div 
                key={tf} 
                className={`pill ${timeframe === tf ? 'active' : ''}`}
                onClick={() => setTimeframe(tf as any)}
                style={{ textTransform: 'uppercase', padding: '6px 12px' }}
              >
                {tf}
              </div>
            ))}
          </div>
          
          <div style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: '16px', padding: '2px' }}>
            <button 
              onClick={() => setChartMode('all')}
              style={{ 
                background: chartMode === 'all' ? 'var(--text-primary)' : 'transparent',
                color: chartMode === 'all' ? 'var(--bg-color)' : 'var(--text-secondary)',
                border: 'none', borderRadius: '14px', padding: '4px 12px', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              {t('Suppliers')}
            </button>
            <button 
              onClick={() => setChartMode('lowest')}
              style={{ 
                background: chartMode === 'lowest' ? 'var(--text-primary)' : 'transparent',
                color: chartMode === 'lowest' ? 'var(--bg-color)' : 'var(--text-secondary)',
                border: 'none', borderRadius: '14px', padding: '4px 12px', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              {t('Trend')}
            </button>
          </div>
        </div>
  
        {/* Chart */}
        <div style={{ height: '240px', margin: '0 -10px', marginBottom: '40px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--bg-secondary)" />
              <XAxis 
                dataKey="timestamp" 
                type="number" 
                domain={['dataMin', 'dataMax']} 
                tickFormatter={formatXAxis}
                tick={{fontSize: 10, fill: 'var(--text-secondary)'}}
                axisLine={false}
                tickLine={false}
              />
              <YAxis domain={['auto', 'auto']} tick={{fontSize: 12, fontFamily: 'var(--font-mono)'}} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
            
            {chartMode === 'lowest' ? (
              <Line 
                type="monotone" 
                dataKey="lowest" 
                name={t("Lowest Price")}
                stroke="var(--color-up)" 
                strokeWidth={3} 
                dot={false}
                isAnimationActive={false}
              />
            ) : (
              Object.values(SUPPLIERS).filter(s => visibleSuppliers.has(s.id)).map(s => {
                const isHovered = hoveredSupplierId === s.id;
                const isFaded = hoveredSupplierId !== null && hoveredSupplierId !== s.id;
                
                return (
                  <Line 
                    key={s.id} 
                    type="monotone" 
                    dataKey={s.id} 
                    name={s.name}
                    stroke={isFaded ? 'var(--text-secondary)' : s.color} 
                    strokeOpacity={isFaded ? 0.3 : 1}
                    strokeWidth={isHovered ? 4 : (s.id === lowestSupplierId && !hoveredSupplierId ? 3 : 1.5)} 
                    dot={false}
                    isAnimationActive={false}
                  />
                );
              })
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Constraints & Alerts */}
      {alerts.filter(a => a.productId === product.id).length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>{t('Active Alerts')}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {alerts.filter(a => a.productId === product.id).map(al => (
              <div key={al.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--color-up)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <LucideBell size={16} color="var(--color-up)" />
                  <span style={{ fontWeight: 500 }}>Target: {al.targetPrice.toFixed(2)}€</span>
                </div>
                <button onClick={() => removeAlert(al.id)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}>{t('Remove')}</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>{t('Market Comparison')}</h3>
        <div style={{ background: 'var(--bg-color)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          {Object.values(SUPPLIERS).sort((a, b) => providerCurrentPrices[a.id] - providerCurrentPrices[b.id]).map((s, idx) => {
            const pPrice = providerCurrentPrices[s.id];
            const yPrice = yesterdayPoint[s.id];
            const change = ((pPrice - yPrice) / yPrice) * 100;
            const isUp = change > 0;
            
            return (
              <div 
                key={s.id} 
                onMouseEnter={() => setHoveredSupplierId(s.id)}
                onMouseLeave={() => setHoveredSupplierId(null)}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '16px', 
                  borderBottom: idx < Object.keys(SUPPLIERS).length - 1 ? '1px solid var(--border-color)' : 'none',
                  background: hoveredSupplierId === s.id ? 'var(--bg-hover)' : 'transparent',
                  transition: 'background 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button 
                    onClick={() => toggleSupplierVisibility(s.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    {visibleSuppliers.has(s.id) 
                      ? <LucideEye size={18} color="var(--text-secondary)" /> 
                      : <LucideEyeOff size={18} color="var(--border-color)" />}
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: visibleSuppliers.has(s.id) ? 1 : 0.4, minWidth: 0, overflow: 'hidden' }}>
                    {s.logo ? (
                      <img 
                        src={s.logo} 
                        alt={s.name}
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                          (e.target as HTMLElement).nextElementSibling!.classList.remove('hidden-fallback');
                        }}
                        style={{ width: '24px', height: '24px', borderRadius: '4px', objectFit: 'contain', background: '#fff', padding: '2px', flexShrink: 0 }}
                      />
                    ) : null}
                    <div className={s.logo ? "hidden-fallback" : ""} style={{ 
                      display: s.logo ? 'none' : 'flex',
                      width: '24px', 
                      height: '24px', 
                      borderRadius: '6px', 
                      background: s.color, 
                      color: '#FFF', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '0.75rem', 
                      fontWeight: 'bold',
                      flexShrink: 0 
                    }}>
                      {s.name?.charAt(0)}
                    </div>
                    <span style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div className="mono-nums" style={{ fontWeight: 600 }}>{pPrice.toFixed(2)}€</div>
                    <div className={`mono-nums ${isUp ? 'text-down' : 'text-up'}`} style={{ fontSize: '0.8rem' }}>
                      {isUp ? '+' : ''}{change.toFixed(1)}%
                    </div>
                  </div>
                  <button 
                    className="secondary-btn" 
                    style={{ padding: '6px 12px', fontSize: '0.8rem', width: 'auto', marginLeft: '16px' }}
                    onClick={() => {
                      setSelectedSupplierId(s.id);
                      setSelectedPrice(pPrice);
                      setShowOrderPanel(true);
                      setShowAlertPanel(false);
                    }}
                  >
                    {t('Buy')}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Buy & Alert Floating Panel */}
      <div style={{ position: 'fixed', bottom: '70px', left: 0, width: '100%', padding: '20px', zIndex: 40, background: (!showOrderPanel && !showAlertPanel) ? 'transparent' : 'linear-gradient(to top, var(--bg-color) 80%, transparent)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          {(!showOrderPanel && !showAlertPanel) ? (
            <button className="buy-btn" onClick={() => {
              setSelectedSupplierId(lowestSupplierId);
              setSelectedPrice(lowestPrice);
              setShowOrderPanel(true);
            }}>
              {t('Buy at Lowest Market Price')}
            </button>
          ) : showOrderPanel ? (
            <div className="card" style={{ padding: '24px', boxShadow: '0 -4px 20px rgba(0,0,0,0.1)' }}>
              {orderSuccess ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <LucideCheckCircle size={48} color="var(--color-up)" style={{ margin: '0 auto 16px' }} />
                  <h3 style={{ marginBottom: '8px' }}>{t('Order Placed Simulated')}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t('Redirecting...')}</p>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ fontWeight: 600 }}>{t('Quantity')} ({product.unit}s)</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <button onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))} style={{ width: '32px', height: '32px', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-primary)' }}>-</button>
                      <input 
                        ref={quantityInputRef}
                        type="number" 
                        min="1" 
                        value={orderQuantity} 
                        onChange={(e) => setOrderQuantity(Math.max(1, Number(e.target.value) || 1))}
                        onFocus={(e) => e.target.select()}
                        className="mono-nums" 
                        style={{ fontSize: '1.2rem', fontWeight: 600, width: '60px', textAlign: 'center', background: 'transparent', border: 'none', borderBottom: '2px solid var(--border-color)', color: 'var(--text-primary)' }} 
                      />
                      <button onClick={() => setOrderQuantity(orderQuantity + 1)} style={{ width: '32px', height: '32px', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-primary)' }}>+</button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                    <div style={{ fontWeight: 600, fontSize: '1.2rem' }}>{t('Estimated Total')}</div>
                    <div className="mono-nums" style={{ fontWeight: 600, fontSize: '1.5rem' }}>{((selectedPrice || lowestPrice) * orderQuantity).toFixed(2)}€</div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="secondary-btn" onClick={() => setShowOrderPanel(false)}>{t('Cancel')}</button>
                    <button className="buy-btn" onClick={handleBuy}>{t('Confirm Demo Order')}</button>
                  </div>
                  <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {t('This is a concept demo. No real world fulfilment will occur.')}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="card" style={{ padding: '24px', boxShadow: '0 -4px 20px rgba(0,0,0,0.1)' }}>
              {alertSuccess ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <LucideCheckCircle size={48} color="var(--color-up)" style={{ margin: '0 auto 16px' }} />
                  <h3 style={{ marginBottom: '8px' }}>{t('Alert Activated')}</h3>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ fontWeight: 600, marginBottom: '16px' }}>{t('Target Price')}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <input 
                        type="range" 
                        min={product.basePrice * 0.5} 
                        max={lowestPrice} 
                        step="0.05"
                        value={Number(alertTargetPriceStr) || 0}
                        onChange={(e) => setAlertTargetPriceStr(e.target.value)}
                        style={{ flex: 1 }}
                      />
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <input 
                          type="number"
                          value={alertTargetPriceStr}
                          onChange={(e) => setAlertTargetPriceStr(e.target.value)}
                          className="mono-nums"
                          step="any"
                          style={{
                            fontSize: '1.2rem',
                            fontWeight: 600,
                            width: '80px',
                            textAlign: 'right',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            color: 'var(--text-primary)'
                          }}
                        />
                        <span style={{ marginLeft: '4px', fontWeight: 'bold' }}>€</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <span>-{(((lowestPrice - (Number(alertTargetPriceStr)||0)) / lowestPrice) * 100).toFixed(1)}%</span>
                      <span>{t('Current')}: {lowestPrice.toFixed(2)}€</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="secondary-btn" onClick={() => setShowAlertPanel(false)}>{t('Cancel')}</button>
                    <button className="buy-btn" onClick={handleCreateAlert}>{t('Set Alert')}</button>
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
