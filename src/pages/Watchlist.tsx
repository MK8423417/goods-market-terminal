import { useState, useMemo, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  Search, 
  Filter, 
  Star, 
  RefreshCw,
  ChevronDown,
  Check,
  Activity
} from 'lucide-react';
import { SUPPLIERS, CATEGORIES } from '../data/mockData';
import { useMarketSimulator } from '../hooks/useMarketSimulator';
import { useAuth } from '../context/AuthContext';
import { TableVirtuoso } from 'react-virtuoso';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line } from 'recharts';
import { CheckCircle as LucideCheckCircle } from 'lucide-react';

export type SortColumn = 'name' | 'category' | 'lowestPrice' | 'change24h';
export type SortDir = 'asc' | 'desc';

function Watchlist() {
  const { 
    market, 
    activeProducts, 
    favorites, 
    toggleFavorite, 
    alerts, 
    placeOrder, 
    isSyncing, 
    syncVisibleProducts,
    searchQuery,
    setSearchQuery,
    globalSearch
  } = useMarketSimulator();
  
  const [filter, setFilter] = useState<string>('All');
  const [sortCol, setSortCol] = useState<SortColumn>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  
  const [showOrderModal, setShowOrderModal] = useState<string | null>(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const [selectedSupplierIds, setSelectedSupplierIds] = useState<Set<string>>(new Set(['mercadona']));
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const supplierDropdownRef = useRef<HTMLDivElement>(null);

  const { t } = useLanguage();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const currencySymbol = user?.currency === 'USD' ? '$' : '€';


  useEffect(() => {
    if (user?.marketMode === 'real') {
      setSelectedSupplierIds(new Set(['mercadona']));
    } else {
      setSelectedSupplierIds(new Set(Object.keys(SUPPLIERS)));
    }
  }, [user?.marketMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (supplierDropdownRef.current && !supplierDropdownRef.current.contains(event.target as Node)) {
        setShowSupplierDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Processed products with current lowest prices, trends, etc.
  const processedProducts = useMemo(() => {
    return (activeProducts || []).map(p => {
      if (!p) return null;
      const history = market[p.id] || [];
      const currentPoint = history.length > 0 ? history[history.length - 1] : {} as any;
      const yesterdayPoint = history.length > 1 ? history[history.length - 2] : null;

      let lowestPrice = Infinity;
      let lowestSupplierId = '';

      selectedSupplierIds.forEach(sid => {
        const price = currentPoint[sid];
        if (price !== undefined && price < lowestPrice) {
          lowestPrice = price;
          lowestSupplierId = sid;
        }
      });

      const yesterdayLowest = yesterdayPoint ? 
        Array.from(selectedSupplierIds).reduce((min, sid) => {
          const pt = (yesterdayPoint as any)[sid];
          return (pt !== undefined && pt < min) ? pt : min;
        }, Infinity) : lowestPrice;

      const isUnavailable = lowestPrice === Infinity;

      const change24h = (!isUnavailable && yesterdayLowest !== Infinity && yesterdayLowest > 0) 
        ? ((lowestPrice - yesterdayLowest) / yesterdayLowest) * 100 
        : 0;

      const activeAlertTarget = alerts.find((a: any) => a.productId === p.id)?.targetPrice;
      const sparkData = history.slice(-20).map((h: any) => ({ val: h[lowestSupplierId] || lowestPrice }));

      return {
        ...p,
        currentLowest: isUnavailable ? p.basePrice : lowestPrice,
        lowestSupplier: isUnavailable ? SUPPLIERS.mercadona : (SUPPLIERS[lowestSupplierId] || SUPPLIERS.mercadona),
        change24h,
        sparkData,
        activeAlertTarget,
        displayName: p.displayName || t(p.name),
        realThumbnail: p.realThumbnail || (p.icon.startsWith('http') ? p.icon : null)
      };
    }).filter((p): p is NonNullable<typeof p> => !!p);
  }, [activeProducts, market, alerts, selectedSupplierIds, t]);

  const sortedAndFiltered = useMemo(() => {
    const filtered = processedProducts.filter(p => {
      if (filter === 'Favorites' && !favorites.includes(p.id)) return false;
      if (filter !== 'All' && filter !== 'Favorites' && p.category !== filter) return false;
      
      // Local search filtering
      if (searchQuery.trim()) {
        const s = searchQuery.toLowerCase();
        if (!p.displayName.toLowerCase().includes(s) && !p.name.toLowerCase().includes(s)) return false;
      }
      
      return true;
    });

    return filtered.sort((a, b) => {
      let comparison = 0;
      if (sortCol === 'name') {
        comparison = a.displayName.localeCompare(b.displayName);
      } else if (sortCol === 'category') {
        comparison = t(a.category).localeCompare(t(b.category));
      } else if (sortCol === 'lowestPrice') {
        comparison = a.currentLowest - b.currentLowest;
      } else if (sortCol === 'change24h') {
        comparison = a.change24h - b.change24h;
      }
      return sortDir === 'asc' ? comparison : -comparison;
    });
  }, [processedProducts, filter, favorites, sortCol, sortDir, t, searchQuery]);

  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleRangeChanged = (range: { startIndex: number; endIndex: number }) => {
    if (user?.marketMode !== 'real') return;
    
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    
    syncTimeoutRef.current = setTimeout(() => {
      const visibleProducts = sortedAndFiltered.slice(range.startIndex, range.endIndex + 1);
      const idsToSync = visibleProducts.map(p => p.id);
      if (idsToSync.length > 0) {
        syncVisibleProducts(idsToSync);
      }
    }, 500);
  };

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

  const handleQuickBuy = async () => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    if (!showOrderModal) return;
    const targetProduct = processedProducts.find(p => p.id === showOrderModal);
    if (!targetProduct) return;

    await placeOrder(targetProduct.id, targetProduct.lowestSupplier.id, orderQuantity, targetProduct.currentLowest, 0, targetProduct.displayName);
    setOrderSuccess(true);
    setTimeout(() => {
      setOrderSuccess(false);
      setShowOrderModal(null);
      setOrderQuantity(1);
    }, 2500);
  };

  const toggleSupplierId = (id: string) => {
    const next = new Set(selectedSupplierIds);
    if (next.has(id)) {
      if (next.size > 1) next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedSupplierIds(next);
  };

  const selectAllSuppliers = () => setSelectedSupplierIds(new Set(Object.keys(SUPPLIERS)));
  const clearSuppliers = () => {
    const firstId = Object.keys(SUPPLIERS)[0];
    setSelectedSupplierIds(new Set([firstId]));
  };

  return (
    <div className="page-content">
      <header style={{ margin: '-20px -20px 10px -20px', paddingBottom: '8px' }}>
        <h1 style={{ marginBottom: '12px', fontSize: '1.2rem' }}>{t('Market Watchlist')}</h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '4px', maxWidth: '600px' }}>
          <div className="search-container" style={{ display: 'flex', alignItems: 'center' }}>
            <Search className="search-icon" size={14} />
            <input 
              type="text" 
              placeholder={t("Search markets or products...")} 
              className="search-bar" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && user?.marketMode === 'real') {
                  globalSearch(searchQuery);
                }
              }}
            />
          </div>

          {user?.marketMode === 'real' && (
            <button 
              onClick={() => globalSearch(searchQuery)}
              disabled={isSyncing || !searchQuery.trim()}
              className="secondary-btn"
              style={{ 
                width: 'auto',
                padding: '10px 16px', 
                fontSize: '0.75rem', 
                borderRadius: '8px',
                background: searchQuery.trim() ? 'var(--color-up)' : 'var(--bg-secondary)',
                color: searchQuery.trim() ? '#fff' : 'var(--text-secondary)',
                border: '1.5px solid var(--border-color)',
                whiteSpace: 'nowrap',
                fontWeight: 600,
                opacity: isSyncing ? 0.6 : 1,
                transition: 'all 0.2s'
              }}
            >
              {isSyncing ? t('Searching...') : t('Search API')}
            </button>
          )}

          <button 
            onClick={() => {
              const visibleIds = sortedAndFiltered.slice(0, 50).map(p => p.id);
              syncVisibleProducts(visibleIds);
            }}
            disabled={isSyncing}
            className="secondary-btn"
            style={{ 
              width: '40px', 
              height: '40px', 
              padding: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              borderRadius: '8px',
              flexShrink: 0,
              background: 'var(--bg-color)',
              border: '1.5px solid var(--border-color)',
              cursor: isSyncing ? 'not-allowed' : 'pointer'
            }}
            title={t('Sync visible products')}
          >
            <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} style={{ color: isSyncing ? 'var(--color-up)' : 'var(--text-secondary)' }} />
          </button>
        </div>

          {user?.marketMode !== 'real' && (
            <div style={{ position: 'relative' }} ref={supplierDropdownRef}>
              <button 
                onClick={() => setShowSupplierDropdown(!showSupplierDropdown)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  whiteSpace: 'nowrap'
                }}
              >
                <Filter size={14} />
                <span>
                  {selectedSupplierIds.size === Object.keys(SUPPLIERS).length 
                    ? t('All Suppliers') 
                    : `${selectedSupplierIds.size} ${t('Suppliers')}`}
                </span>
                <ChevronDown size={14} style={{ transform: showSupplierDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {showSupplierDropdown && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: 0,
                  width: '240px',
                  background: 'var(--bg-color)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                  zIndex: 1000,
                  overflow: 'hidden'
                }}>
                  <div style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{t('Select Suppliers')}</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={selectAllSuppliers} style={{ background: 'none', border: 'none', color: 'var(--color-up)', cursor: 'pointer', fontSize: '0.75rem', padding: 0 }}>{t('All')}</button>
                      <button onClick={clearSuppliers} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.75rem', padding: 0 }}>{t('Reset')}</button>
                    </div>
                  </div>
                  <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {Object.values(SUPPLIERS).map(s => (
                        <div 
                          key={s.id} 
                          onClick={() => toggleSupplierId(s.id)}
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            padding: '8px 10px', 
                            borderRadius: '8px',
                            cursor: 'pointer',
                            background: selectedSupplierIds.has(s.id) ? 'var(--bg-secondary)' : 'transparent',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {s.logo ? (
                              <img src={s.logo} alt="" style={{ width: '18px', height: '18px', borderRadius: '4px', background: '#fff' }} />
                            ) : (
                              <div style={{ width: '18px', height: '18px', borderRadius: '4px', background: s.color, color: '#fff', fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{s.name.charAt(0)}</div>
                            )}
                            <span style={{ fontSize: '0.85rem', color: selectedSupplierIds.has(s.id) ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{s.name}</span>
                          </div>
                          {selectedSupplierIds.has(s.id) && <Check size={14} color="var(--color-up)" />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="pill-scroll" style={{ paddingBottom: 0, flex: 1, margin: 0, overflowX: 'auto', display: 'flex', gap: '8px' }}>
            {['All', 'Favorites', ...CATEGORIES].map(cat => (
              <div 
                key={cat} 
                className={`pill ${filter === cat ? 'active' : ''}`}
                onClick={() => setFilter(cat)}
                style={{ padding: '4px 12px', fontSize: '0.75rem', whiteSpace: 'nowrap', cursor: 'pointer' }}
              >
                {cat === 'Favorites' ? <><Star size={12} style={{marginRight: '4px', verticalAlign: 'text-bottom'}}/>{t('Favorites')}</> : t(cat)}
              </div>
            ))}
          </div>

        {isSyncing && (
          <div style={{ 
            margin: '8px -20px 0 -20px', 
            padding: '4px 20px', 
            background: 'rgba(0, 130, 78, 0.1)', 
            borderTop: '1px solid rgba(0, 130, 78, 0.2)',
            borderBottom: '1px solid rgba(0, 130, 78, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--color-up)',
            fontSize: '0.75rem',
            fontWeight: 500
          }}>
            <RefreshCw size={12} className="animate-spin" />
            {t('Syncing live prices...')} (Mercadona)
          </div>
        )}
      </header>

      <section style={{ height: 'calc(100vh - 150px)', margin: '0 -20px' }}>
        <TableVirtuoso
          style={{ height: '100%' }}
          data={sortedAndFiltered}
          rangeChanged={handleRangeChanged}
          fixedHeaderContent={() => (
            <tr style={{ background: 'var(--bg-color)' }}>
               <th style={{ width: '50px', padding: '12px 16px' }}></th>
               <th onClick={() => toggleSort('name')} style={{ cursor: 'pointer', padding: '12px 16px', textAlign: 'left' }}>{user?.marketMode === 'real' ? 'Mercadona Product' : t('Product')}{sortIndicator('name')}</th>
               <th onClick={() => toggleSort('category')} style={{ width: '120px', cursor: 'pointer', padding: '12px 16px', textAlign: 'left' }}>{t('Category')}{sortIndicator('category')}</th>
              <th style={{ width: '80px', padding: '12px 16px', textAlign: 'left' }}>{t('Unit')}</th>
              <th onClick={() => toggleSort('lowestPrice')} style={{ width: '130px', textAlign: 'right', cursor: 'pointer', padding: '12px 16px' }}>{t('Lowest Price')}{sortIndicator('lowestPrice')}</th>
              <th onClick={() => toggleSort('change24h')} style={{ width: '100px', textAlign: 'right', cursor: 'pointer', padding: '12px 16px' }}>{t('24h Change')}{sortIndicator('change24h')}</th>
              <th style={{ width: '150px', padding: '12px 16px', textAlign: 'left' }}>{t('Supplier')}</th>
              <th style={{ width: '100px', padding: '12px 16px', textAlign: 'center' }}>{t('Trend (7d)')}</th>
              <th style={{ width: '100px', textAlign: 'right', padding: '12px 16px' }}>{t('Actions')}</th>
            </tr>
          )}
          itemContent={(_index, p) => {
            const isUp = p.change24h > 0;
            const isFavorite = favorites.includes(p.id);
            return (
              <>
                <td onClick={(e) => { e.stopPropagation(); toggleFavorite(p.id); }} style={{ cursor: 'pointer', padding: '8px 16px', textAlign: 'center' }}>
                  <Star 
                    size={16} 
                    color={isFavorite ? '#F5A623' : 'var(--text-secondary)'} 
                    fill={isFavorite ? '#F5A623' : 'none'} 
                  />
                </td>
                <td style={{ padding: '8px 16px', minWidth: 0, cursor: 'pointer' }} onClick={() => navigate(`/product/${p.id}`)}>
                  <div className="table-icon-cell" style={{ gap: '8px', minWidth: 0, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
                    {p.realThumbnail ? (
                      <img src={p.realThumbnail} alt="" style={{ width: '24px', height: '24px', borderRadius: '4px', background: '#fff', flexShrink: 0 }} />
                    ) : (
                      <div className="ticker-icon" style={{ width: '24px', height: '24px', fontSize: '0.8rem', flexShrink: 0 }}>{p.icon}</div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.displayName}</span>
                    </div>
                  </div>
                </td>
                <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', padding: '8px 16px' }} onClick={() => navigate(`/product/${p.id}`)}>{t(p.category)}</td>
                <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', padding: '8px 16px' }} onClick={() => navigate(`/product/${p.id}`)}>{p.unit}</td>
                <td className="mono-nums" style={{ textAlign: 'right', padding: '8px 16px' }} onClick={() => navigate(`/product/${p.id}`)}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                    {p.activeAlertTarget && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <Activity size={10}/>
                        {p.activeAlertTarget.toFixed(2)}{currencySymbol}
                      </div>
                    )}
                    <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{p.currentLowest.toFixed(2)}{currencySymbol}</span>
                  </div>
                </td>
                <td className={`mono-nums ${isUp ? 'text-down' : 'text-up'}`} style={{ fontWeight: 500, fontSize: '0.8rem', textAlign: 'right', padding: '8px 16px' }} onClick={() => navigate(`/product/${p.id}`)}>
                  {isUp ? '+' : ''}{p.change24h.toFixed(1)}%
                </td>
                <td style={{ padding: '8px 16px' }} onClick={() => navigate(`/product/${p.id}`)}>
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
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{p.lowestSupplier?.name}</span>
                  </div>
                </td>
                <td style={{ padding: '8px 16px' }} onClick={() => navigate(`/product/${p.id}`)}>
                  <div style={{ height: '24px', width: '60px', margin: '0 auto' }}>
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
                <td style={{ textAlign: 'right', padding: '8px 16px' }}>
                  <button 
                    className="buy-btn" 
                    style={{ padding: '4px 8px', fontSize: '0.75rem', width: 'auto' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isAuthenticated) {
                        navigate('/auth');
                        return;
                      }
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

      {showOrderModal && (
        <div style={{ position: 'fixed', bottom: '20px', left: 0, width: '100%', padding: '0 20px', zIndex: 100 }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="card" style={{ padding: '24px', boxShadow: '0 -4px 20px rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', margin: 0 }}>
              {orderSuccess ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <LucideCheckCircle size={48} color="var(--color-up)" style={{ margin: '0 auto 16px' }} />
                  <h3 style={{ marginBottom: '8px' }}>{t('Order Successful')}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t('Updating inventory...')}</p>
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
                      {((processedProducts.find(p => p.id === showOrderModal)?.currentLowest || 0) * orderQuantity).toFixed(2)}{currencySymbol}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="secondary-btn" onClick={() => { setShowOrderModal(null); setOrderQuantity(1); }}>{t('Cancel')}</button>
                    <button className="buy-btn" onClick={handleQuickBuy}>{t('Confirm Order')}</button>
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
