import { useMemo, useState, useRef, useEffect } from 'react';
import { useMarketSimulator } from '../hooks/useMarketSimulator';
import { SUPPLIERS } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, ChevronUp, ChevronDown, CheckCircle as LucideCheckCircle } from 'lucide-react';

export default function MyBusiness() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { 
    market, 
    activeProducts, 
    orders, 
    inventory, 
    demand, 
    updateDemand, 
    removeDemand, 
    favorites, 
    toggleFavorite, 
    placeOrder 
  } = useMarketSimulator();
  
  const currencySymbol = user?.currency === 'USD' ? '$' : '€';
  const [showAdd, setShowAdd] = useState(false);
  const [addSearchTerm, setAddSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>({ key: 'totalValue', direction: 'desc' });

  // Quick buy state
  const [showOrderModal, setShowOrderModal] = useState<string | null>(null);
  const [orderQuantity, setOrderQuantity] = useState<number | ''>(1);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const quantityInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showOrderModal && quantityInputRef.current) {
      quantityInputRef.current.focus();
      quantityInputRef.current.select();
    }
  }, [showOrderModal]);

  // Combine products with their current valuation and inventory counts
  const businessAssets = useMemo(() => {
    return activeProducts
      .filter(p => (inventory[p.id] && inventory[p.id] > 0) || demand[p.id] !== undefined)
      .map(p => {
        const history = market[p.id] || [];
        let lowestPrice = p.basePrice;
        let lowestSupplierId = 'mercadona';

        if (history.length > 0) {
          const latest: any = history[history.length - 1];
          let minP = Infinity;
          Object.keys(SUPPLIERS).forEach(sId => {
            if (latest[sId] !== undefined && latest[sId] < minP) {
              minP = latest[sId];
              lowestSupplierId = sId;
            }
          });
          if (minP !== Infinity) lowestPrice = minP;
        }

        const count = inventory[p.id] || 0;
        const target = demand[p.id] || 0;
        const totalValue = count * lowestPrice;

        // Calculate historical buy prices
        const productOrders = orders.filter((o: any) => o.productId === p.id);
        
        let avgBuyPrice = null;
        if (productOrders.length > 0) {
          const totalSpent = productOrders.reduce((sum: number, o: any) => sum + (o.price * o.quantity), 0);
          const totalQty = productOrders.reduce((sum: number, o: any) => sum + o.quantity, 0);
          avgBuyPrice = totalSpent / totalQty;
        }

        const lastBuyPrice = productOrders.length > 0 ? productOrders[productOrders.length - 1].price : null;

        return {
          ...p,
          displayName: p.displayName || t(p.name),
          currentLowest: lowestPrice,
          lowestSupplier: SUPPLIERS[lowestSupplierId] || SUPPLIERS.mercadona,
          count,
          target,
          totalValue,
          avgBuyPrice,
          lastBuyPrice
        };
      })
      .sort((a, b) => {
        if (!sortConfig) return 0;
        let aVal: any = a[sortConfig.key as keyof typeof a];
        let bVal: any = b[sortConfig.key as keyof typeof b];

        if (sortConfig.key === 'name') {
          aVal = a.displayName.toLowerCase();
          bVal = b.displayName.toLowerCase();
          return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }
        return 0;
      });
  }, [activeProducts, market, inventory, demand, orders, sortConfig, t]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  const handleQuickBuy = async () => {
    if (!showOrderModal) return;
    const targetAsset = businessAssets.find(a => a.id === showOrderModal);
    if (!targetAsset) return;

    await placeOrder(
      targetAsset.id, 
      targetAsset.lowestSupplier.id, 
      Number(orderQuantity) || 1, 
      targetAsset.currentLowest, 
      0, 
      targetAsset.displayName
    );
    
    setOrderSuccess(true);
    setTimeout(() => {
      setOrderSuccess(false);
      setShowOrderModal(null);
      setOrderQuantity(1);
    }, 2500);
  };

  const totalPortfolioValue = businessAssets.reduce((sum, asset) => sum + asset.totalValue, 0);

  return (
    <div className="page-content">
      <header style={{ margin: '-20px -20px 20px -20px', paddingBottom: '16px' }}>
        <h1 style={{ marginBottom: '8px', fontSize: '1.5rem' }}>{t('My Business')}</h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {t('Total Valuation')}: <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '1.2rem' }}>{totalPortfolioValue.toFixed(2)}{currencySymbol}</span>
          </div>
          <button 
            onClick={() => setShowAdd(!showAdd)} 
            className="secondary-btn" 
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
          >
            + {t('Add')}
          </button>
        </div>

        {showAdd && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => { setShowAdd(false); setAddSearchTerm(''); }}>
            <div className="card" style={{ width: '100%', maxWidth: '500px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', padding: '24px', margin: 0 }} onClick={e => e.stopPropagation()}>
              <h2 style={{ marginBottom: '20px', fontSize: '1.3rem' }}>{t('Add Product to Business')}</h2>
              <input 
                autoFocus
                type="text" 
                placeholder={t("Search products...")} 
                value={addSearchTerm}
                onChange={e => setAddSearchTerm(e.target.value)}
                style={{ padding: '16px', fontSize: '1.2rem', marginBottom: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', width: '100%', boxSizing: 'border-box' }}
              />
              <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
                {activeProducts
                  .filter(p => !inventory[p.id] && demand[p.id] === undefined)
                  .filter(p => {
                    const s = addSearchTerm.toLowerCase();
                    return p.displayName?.toLowerCase().includes(s) || t(p.name).toLowerCase().includes(s) || p.category.toLowerCase().includes(s);
                  })
                  .slice(0, 50) // Limit results for performance
                  .map(p => (
                  <button 
                    key={p.id}
                    onClick={async () => { 
                      await updateDemand(p.id, 1); 
                      // Automatically add to favorites if tracking as business
                      if (!favorites.includes(p.id)) await toggleFavorite(p.id);
                      setShowAdd(false); 
                      setAddSearchTerm('');
                    }}
                    style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', padding: '12px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', color: 'var(--text-primary)', textAlign: 'left', width: '100%', transition: 'background 0.2s' }}
                  >
                    {p.realThumbnail ? (
                      <img src={p.realThumbnail} alt="" style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#fff' }} />
                    ) : (
                      <span style={{ fontSize: '1.8rem' }}>{p.icon}</span>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '4px' }}>{p.displayName || t(p.name)}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t(p.category)}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {businessAssets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          {t('Your inventory is empty. Track products to see them here!')}
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ margin: 0, width: '100%' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)' }}>
                  <th style={{ width: '22%', cursor: 'pointer' }} onClick={() => requestSort('name')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {t('Product')} {getSortIcon('name')}
                    </div>
                  </th>
                  <th style={{ width: '10%', textAlign: 'right', cursor: 'pointer' }} onClick={() => requestSort('target')}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                      {t('Target')} {getSortIcon('target')}
                    </div>
                  </th>
                  <th style={{ width: '10%', textAlign: 'right', cursor: 'pointer' }} onClick={() => requestSort('count')}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                      {t('Stock')} {getSortIcon('count')}
                    </div>
                  </th>
                  <th style={{ width: '12%', textAlign: 'right', cursor: 'pointer' }} onClick={() => requestSort('avgBuyPrice')}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                      {t('Avg Buy')} {getSortIcon('avgBuyPrice')}
                    </div>
                  </th>
                  <th style={{ width: '12%', textAlign: 'right', cursor: 'pointer' }} onClick={() => requestSort('currentLowest')}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                      {t('Live Price')} {getSortIcon('currentLowest')}
                    </div>
                  </th>
                  <th style={{ width: '12%', textAlign: 'right', cursor: 'pointer' }} onClick={() => requestSort('totalValue')}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                      {t('Value')} {getSortIcon('totalValue')}
                    </div>
                  </th>
                  <th style={{ width: '10%', textAlign: 'right' }}>{t('Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {businessAssets.map(asset => (
                  <tr key={asset.id}>
                    <td>
                      <div className="table-icon-cell" style={{ minWidth: 0, overflow: 'hidden', gap: '8px' }}>
                        {asset.realThumbnail ? (
                          <img src={asset.realThumbnail} alt="" style={{ width: '32px', height: '32px', borderRadius: '4px', background: '#fff', flexShrink: 0 }} />
                        ) : (
                          <div className="ticker-icon" style={{ width: '32px', height: '32px', fontSize: '1rem', flexShrink: 0 }}>{asset.icon}</div>
                        )}
                        <div style={{ minWidth: 0, overflow: 'hidden', flex: 1 }}>
                          <div style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{asset.displayName}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t(asset.category)}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <input 
                        type="number"
                        className="mono-nums"
                        value={asset.target || ''}
                        onChange={async (e) => await updateDemand(asset.id, e.target.value === '' ? 0 : Number(e.target.value))}
                        onFocus={(e) => e.target.select()}
                        placeholder="0"
                        style={{ 
                          width: '70px', 
                          textAlign: 'right', 
                          padding: '6px', 
                          borderRadius: '6px', 
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-color)',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span 
                        className="mono-nums"
                        style={{ 
                          display: 'inline-block',
                          width: '70px', 
                          textAlign: 'right', 
                          padding: '6px', 
                          color: asset.count >= (asset.target || 0) && (asset.target || 0) > 0 ? 'var(--color-up)' : 'var(--text-primary)',
                          fontWeight: asset.count >= (asset.target || 0) && (asset.target || 0) > 0 ? 'bold' : 'normal'
                        }}
                      >{asset.count}</span>
                    </td>
                    <td className="mono-nums" style={{ textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      {asset.avgBuyPrice ? `${asset.avgBuyPrice.toFixed(2)}${currencySymbol}` : '—'}
                    </td>
                    <td className="mono-nums" style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                        {asset.lowestSupplier?.logo ? (
                          <img 
                            src={asset.lowestSupplier.logo} 
                            alt="logo"
                            style={{ width: '14px', height: '14px', borderRadius: '3px', objectFit: 'contain', background: '#fff', padding: '1px' }}
                          />
                        ) : (
                          <div style={{ 
                            width: '14px', 
                            height: '14px', 
                            borderRadius: '3px', 
                            background: asset.lowestSupplier?.color, 
                            color: '#FFF', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            fontSize: '0.5rem', 
                            fontWeight: 'bold' 
                          }}>
                            {asset.lowestSupplier?.name?.charAt(0)}
                          </div>
                        )}
                        <span>{asset.currentLowest.toFixed(2)}{currencySymbol}</span>
                      </div>
                    </td>
                    <td className="mono-nums" style={{ textAlign: 'right', fontWeight: 'bold' }}>{asset.totalValue.toFixed(2)}{currencySymbol}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          className="buy-btn" 
                          style={{ padding: '4px 8px', fontSize: '0.75rem', width: 'auto' }}
                          onClick={() => setShowOrderModal(asset.id)}
                        >
                          {t('Buy')}
                        </button>
                        <button 
                          style={{ background: 'none', border: 'none', color: 'var(--color-down)', cursor: 'pointer', padding: '4px' }}
                          onClick={async () => {
                            if (window.confirm(t("Remove this product from your tracked business list?"))) {
                              await removeDemand(asset.id);
                            }
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Embedded Global Quick Buy Panel */}
      {showOrderModal && (
        <div style={{ position: 'fixed', bottom: '20px', left: 0, width: '100%', padding: '0 20px', zIndex: 100 }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="card" style={{ padding: '24px', boxShadow: '0 -4px 20px rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', margin: 0 }}>
              {orderSuccess ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <LucideCheckCircle size={48} color="var(--color-up)" style={{ margin: '0 auto 16px' }} />
                  <h3 style={{ marginBottom: '8px' }}>{t('Order Successful')}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t('Updating stock...')}</p>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ fontWeight: 600 }}>{t('Quick Buy Quantity')}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <button onClick={() => setOrderQuantity(Math.max(1, (Number(orderQuantity) || 1) - 1))} style={{ width: '32px', height: '32px', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-primary)' }}>-</button>
                      <input 
                        ref={quantityInputRef}
                        type="number" 
                        min="1" 
                        value={orderQuantity} 
                        onChange={(e) => setOrderQuantity(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                        onFocus={(e) => e.target.select()}
                        className="mono-nums" 
                        style={{ fontSize: '1.2rem', fontWeight: 600, width: '60px', textAlign: 'center', background: 'transparent', border: 'none', borderBottom: '2px solid var(--border-color)', color: 'var(--text-primary)' }} 
                      />
                      <button onClick={() => setOrderQuantity((Number(orderQuantity) || 0) + 1)} style={{ width: '32px', height: '32px', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-primary)' }}>+</button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                    <div style={{ fontWeight: 600, fontSize: '1.2rem' }}>{t('Estimated Total')}</div>
                    <div className="mono-nums" style={{ fontWeight: 600, fontSize: '1.5rem' }}>
                      {((businessAssets.find(a => a.id === showOrderModal)?.currentLowest || 0) * (Number(orderQuantity) || 0)).toFixed(2)}{currencySymbol}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="secondary-btn" onClick={() => { setShowOrderModal(null); setOrderQuantity(1); }}>{t('Cancel')}</button>
                    <button className="buy-btn" onClick={handleQuickBuy} disabled={!orderQuantity || Number(orderQuantity) === 0}>{t('Confirm Order')}</button>
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
