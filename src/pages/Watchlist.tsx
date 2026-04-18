import React, { useState } from 'react';
import { useMarketSimulator } from '../hooks/useMarketSimulator';
import { PRODUCTS, CATEGORIES, SUPPLIERS } from '../data/mockData';
import { Link, useNavigate } from 'react-router-dom';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { Search, Star, ExternalLink, Activity, CheckCircle as LucideCheckCircle } from 'lucide-react';
import { TableVirtuoso } from 'react-virtuoso';
import { useLanguage } from '../context/LanguageContext';

export type SortColumn = 'name' | 'category' | 'lowestPrice' | 'change24h';
export type SortDir = 'asc' | 'desc';

function Watchlist() {
  const { market, favorites, toggleFavorite, alerts, placeOrder } = useMarketSimulator();
  const [filter, setFilter] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState<SortColumn>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  
  // Quick buy state
  const [showOrderModal, setShowOrderModal] = useState<string | null>(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderSuccess, setOrderSuccess] = useState(false);
  
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Process market data to find current lowest and 24h change
  const processedProducts = PRODUCTS.map(p => {
    const history = market[p.id] || [];
    if (history.length < 2) return { ...p, currentLowest: 0, lowestSupplier: '', change24h: 0, history: [], sparkData: [] };

    const currentPoint = history[history.length - 1];
    const yesterdayPoint = history[Math.max(0, history.length - 8)]; // Approximation of 24h ago in our ticks

    let lowestPrice = Infinity;
    let lowestSupplierId = '';
    
    Object.keys(SUPPLIERS).forEach(sId => {
      if (currentPoint[sId] < lowestPrice) {
        lowestPrice = currentPoint[sId];
        lowestSupplierId = sId;
      }
    });

    let yesterdayLowest = Infinity;
    Object.keys(SUPPLIERS).forEach(sId => {
      if (yesterdayPoint[sId] < yesterdayLowest) yesterdayLowest = yesterdayPoint[sId];
    });

    const change24h = ((lowestPrice - yesterdayLowest) / yesterdayLowest) * 100;

    // Retrieve active alerts to attach to object
    const activeAlertTarget = alerts.find(a => a.productId === p.id)?.targetPrice;

    // formatted history for sparkline
    const sparkData = history.slice(-20).map(h => ({ val: h[lowestSupplierId] }));

    return {
      ...p,
      currentLowest: lowestPrice,
      lowestSupplier: SUPPLIERS[lowestSupplierId],
      change24h,
      sparkData,
      activeAlertTarget
    };
  });

  const filtered = processedProducts.filter(p => {
    if (filter === 'Favorites' && !favorites.includes(p.id)) return false;
    if (filter !== 'All' && filter !== 'Favorites' && p.category !== filter) return false;
    if (search) {
      const s = search.toLowerCase();
      const nameMatch = t(p.name).toLowerCase().includes(s);
      const supplierMatch = p.lowestSupplier?.name?.toLowerCase().includes(s);
      if (!nameMatch && !supplierMatch) return false;
    }
    return true;
  });

  const sortedAndFiltered = filtered.sort((a, b) => {
    let comparison = 0;
    if (sortCol === 'name') {
      comparison = t(a.name).localeCompare(t(b.name));
    } else if (sortCol === 'category') {
      comparison = t(a.category).localeCompare(t(b.category));
    } else if (sortCol === 'lowestPrice') {
      comparison = a.currentLowest - b.currentLowest;
    } else if (sortCol === 'change24h') {
      comparison = a.change24h - b.change24h;
    }
    return sortDir === 'asc' ? comparison : -comparison;
  });

  const toggleSort = (col: SortColumn) => {
    if (sortCol === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  };

  const sortIndicator = (col: SortColumn) => {
    if (sortCol !== col) return null;
    return <span style={{ marginLeft: '4px' }}>{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  const handleQuickBuy = () => {
    if (!showOrderModal) return;
    const targetProduct = processedProducts.find(p => p.id === showOrderModal);
    if (!targetProduct) return;

    placeOrder({
      productId: targetProduct.id,
      productName: targetProduct.name,
      supplierId: targetProduct.lowestSupplier.id,
      price: targetProduct.currentLowest,
      quantity: orderQuantity,
      savings: 0 // Simplification for Quick Buy metric comparison
    });
    setOrderSuccess(true);
    setTimeout(() => {
      setOrderSuccess(false);
      setShowOrderModal(null);
      setOrderQuantity(1);
    }, 2500);
  };

  return (
    <div className="page-content">
      <header style={{ margin: '-20px -20px 10px -20px', paddingBottom: '8px' }}>
        <h1 style={{ marginBottom: '12px', fontSize: '1.2rem' }}>{t('Market Watchlist')}</h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
          <div className="search-container" style={{ margin: 0, minWidth: '240px' }}>
            <Search className="search-icon" size={16} />
            <input 
              type="text" 
              placeholder={t("Search products...")} 
              className="search-bar" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: '8px 16px 8px 36px', fontSize: '0.85rem' }}
            />
          </div>

          <div className="pill-scroll" style={{ paddingBottom: 0, flex: 1, margin: 0 }}>
            {['All', 'Favorites', ...CATEGORIES].map(cat => (
              <div 
                key={cat} 
                className={`pill ${filter === cat ? 'active' : ''}`}
                onClick={() => setFilter(cat)}
                style={{ padding: '4px 12px', fontSize: '0.75rem' }}
              >
                {cat === 'Favorites' ? <><Star size={12} style={{marginRight: '4px', verticalAlign: 'text-bottom'}}/>{t('Favorites')}</> : t(cat)}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Main List Virtualized Table */}
      <section style={{ height: 'calc(100vh - 150px)', margin: '0 -20px' }}>
        <TableVirtuoso
          className="data-table"
          data={sortedAndFiltered}
          style={{ tableLayout: 'fixed', width: '100%' }}
          fixedHeaderContent={() => (
            <tr style={{ background: 'var(--bg-color)' }}>
              <th style={{ width: '5%', padding: '8px 16px' }}></th>
              <th onClick={() => toggleSort('name')} style={{ width: '20%', cursor: 'pointer', padding: '8px 16px' }}>{t('Product')}{sortIndicator('name')}</th>
              <th onClick={() => toggleSort('category')} style={{ width: '15%', cursor: 'pointer', padding: '8px 16px' }}>{t('Category')}{sortIndicator('category')}</th>
              <th style={{ width: '10%', padding: '8px 16px' }}>{t('Unit')}</th>
              <th onClick={() => toggleSort('lowestPrice')} style={{ width: '15%', textAlign: 'right', cursor: 'pointer', padding: '8px 16px' }}>{t('Lowest Price')}{sortIndicator('lowestPrice')}</th>
              <th onClick={() => toggleSort('change24h')} style={{ width: '10%', textAlign: 'right', cursor: 'pointer', padding: '8px 16px' }}>{t('24h Change')}{sortIndicator('change24h')}</th>
              <th style={{ width: '15%', padding: '8px 16px' }}>{t('Supplier')}</th>
              <th style={{ width: '10%', padding: '8px 16px' }}>{t('Trend (7d)')}</th>
              <th style={{ width: '10%', textAlign: 'right', padding: '8px 16px' }}>{t('Actions')}</th>
            </tr>
          )}
          itemContent={(index, p) => {
            const isUp = p.change24h > 0;
            const isFavorite = favorites.includes(p.id);
            return (
              <>
                <td onClick={(e) => { e.stopPropagation(); toggleFavorite(p.id); }} style={{ width: '5%', cursor: 'pointer', padding: '4px 16px' }}>
                  <Star 
                    size={16} 
                    color={isFavorite ? '#F5A623' : 'var(--text-secondary)'} 
                    fill={isFavorite ? '#F5A623' : 'none'} 
                  />
                </td>
                <td style={{ width: '20%', padding: '4px 16px', minWidth: 0 }} onClick={() => navigate(`/product/${p.id}`)}>
                  <div className="table-icon-cell" style={{ gap: '8px', minWidth: 0, overflow: 'hidden' }}>
                    <div className="ticker-icon" style={{ width: '24px', height: '24px', fontSize: '0.8rem', flexShrink: 0 }}>{p.icon}</div>
                    <span style={{ fontWeight: 500, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t(p.name)}</span>
                  </div>
                </td>
                <td style={{ width: '15%', color: 'var(--text-secondary)', fontSize: '0.8rem', padding: '4px 16px' }} onClick={() => navigate(`/product/${p.id}`)}>{t(p.category)}</td>
                <td style={{ width: '10%', color: 'var(--text-secondary)', fontSize: '0.8rem', padding: '4px 16px' }} onClick={() => navigate(`/product/${p.id}`)}>{p.unit}</td>
                <td className="mono-nums" style={{ width: '15%', textAlign: 'right', padding: '4px 16px' }} onClick={() => navigate(`/product/${p.id}`)}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                    {p.activeAlertTarget && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <Activity size={10}/>
                        {p.activeAlertTarget.toFixed(2)}€
                      </div>
                    )}
                    <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{p.currentLowest.toFixed(2)}€</span>
                  </div>
                </td>
                <td className={`mono-nums ${isUp ? 'text-down' : 'text-up'}`} style={{ width: '10%', fontWeight: 500, fontSize: '0.8rem', textAlign: 'right', padding: '4px 16px' }} onClick={() => navigate(`/product/${p.id}`)}>
                  {isUp ? '+' : ''}{p.change24h.toFixed(1)}%
                </td>
                <td style={{ width: '15%', padding: '4px 16px' }} onClick={() => navigate(`/product/${p.id}`)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {p.lowestSupplier?.logo ? (
                      <img 
                        src={p.lowestSupplier.logo} 
                        alt="logo"
                        style={{ width: '16px', height: '16px', borderRadius: '4px', objectFit: 'contain', background: '#fff', padding: '1px' }}
                      />
                    ) : (
                      <div style={{ 
                        width: '16px', 
                        height: '16px', 
                        borderRadius: '4px', 
                        background: p.lowestSupplier?.color, 
                        color: '#FFF', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '0.6rem', 
                        fontWeight: 'bold' 
                      }}>
                        {p.lowestSupplier?.name?.charAt(0)}
                      </div>
                    )}
                    <span className="supplier-chip" style={{ background: 'transparent', color: 'var(--text-primary)', padding: 0, fontSize: '0.8rem' }}>{p.lowestSupplier?.name}</span>
                  </div>
                </td>
                <td style={{ width: '10%', padding: '4px 16px' }} onClick={() => navigate(`/product/${p.id}`)}>
                  <div className="table-spark-container" style={{ height: '24px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={p.sparkData}>
                        <Line 
                          type="monotone" 
                          dataKey="val" 
                          stroke={isUp ? 'var(--color-down)' : 'var(--color-up)'} 
                          strokeWidth={1.5} 
                          dot={false}
                          isAnimationActive={false} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </td>
                <td style={{ width: '10%', textAlign: 'right', padding: '4px 16px' }}>
                  <button 
                    className="buy-btn" 
                    style={{ padding: '4px 8px', fontSize: '0.75rem', width: 'auto', display: 'inline-flex' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowOrderModal(p.id);
                    }}
                  >
                    {t('Buy')}
                  </button>
                </td>
              </>
            );
          }}
        />
      </section>

      {/* Embedded Global Quick Buy Panel */}
      {showOrderModal && (
        <div style={{ position: 'fixed', bottom: '20px', left: 0, width: '100%', padding: '0 20px', zIndex: 100 }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="card" style={{ padding: '24px', boxShadow: '0 -4px 20px rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', margin: 0 }}>
              {orderSuccess ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <LucideCheckCircle size={48} color="var(--color-up)" style={{ margin: '0 auto 16px' }} />
                  <h3 style={{ marginBottom: '8px' }}>{t('Order Placed Simulated')}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t('Redirecting...')}</p>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ fontWeight: 600 }}>{t('Quick Buy Quantity')}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <button onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))} style={{ width: '32px', height: '32px', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-primary)' }}>-</button>
                      <input 
                        type="number" 
                        min="1" 
                        value={orderQuantity} 
                        onChange={(e) => setOrderQuantity(Math.max(1, Number(e.target.value) || 1))}
                        className="mono-nums" 
                        style={{ fontSize: '1.2rem', fontWeight: 600, width: '60px', textAlign: 'center', background: 'transparent', border: 'none', borderBottom: '2px solid var(--border-color)', color: 'var(--text-primary)' }} 
                      />
                      <button onClick={() => setOrderQuantity(orderQuantity + 1)} style={{ width: '32px', height: '32px', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-primary)' }}>+</button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                    <div style={{ fontWeight: 600, fontSize: '1.2rem' }}>{t('Estimated Total')}</div>
                    <div className="mono-nums" style={{ fontWeight: 600, fontSize: '1.5rem' }}>
                      {((processedProducts.find(p => p.id === showOrderModal)?.currentLowest || 0) * orderQuantity).toFixed(2)}€
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="secondary-btn" onClick={() => { setShowOrderModal(null); setOrderQuantity(1); }}>{t('Cancel')}</button>
                    <button className="buy-btn" onClick={handleQuickBuy}>{t('Confirm Demo Order')}</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Watchlist;
