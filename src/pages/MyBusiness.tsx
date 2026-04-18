import React, { useMemo, useState } from 'react';
import { useMarketSimulator } from '../hooks/useMarketSimulator';
import { PRODUCTS } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';

export default function MyBusiness() {
  const { t } = useLanguage();
  const { market, inventory, demand, updateDemand, favorites, toggleFavorite } = useMarketSimulator();
  const [showAdd, setShowAdd] = useState(false);
  const [addSearchTerm, setAddSearchTerm] = useState('');

  // Combine products with their current valuation and inventory counts
  const businessAssets = useMemo(() => {
    return PRODUCTS
      .filter(p => (inventory[p.id] && inventory[p.id] > 0) || (demand[p.id] && demand[p.id] > 0))
      .map(p => {
        const prices = market[p.id];
        let currentLowest = p.basePrice;
        if (prices && prices.length > 0) {
          const latest = prices[prices.length - 1];
          const vals = Object.values(latest).filter(v => typeof v === 'number') as number[];
          if (vals.length > 0) currentLowest = Math.min(...vals);
        }
        const count = inventory[p.id] || 0;
        const target = demand[p.id] || 0;
        const totalValue = count * currentLowest;

        return {
          ...p,
          currentLowest,
          count,
          target,
          totalValue
        };
      })
      .sort((a, b) => b.totalValue - a.totalValue);
  }, [market, inventory, demand]);

  const totalPortfolioValue = businessAssets.reduce((sum, asset) => sum + asset.totalValue, 0);

  return (
    <div className="page-content">
      <header style={{ margin: '-20px -20px 20px -20px', paddingBottom: '16px' }}>
        <h1 style={{ marginBottom: '8px', fontSize: '1.5rem' }}>{t('My Business')}</h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {t('Total Valuation')}: <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '1.2rem' }}>{totalPortfolioValue.toFixed(2)}€</span>
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
                {PRODUCTS
                  .filter(p => (!inventory[p.id] || inventory[p.id] === 0) && (!demand[p.id] || demand[p.id] === 0))
                  .filter(p => p.name.toLowerCase().includes(addSearchTerm.toLowerCase()) || t(p.name).toLowerCase().includes(addSearchTerm.toLowerCase()))
                  .map(p => (
                  <button 
                    key={p.id}
                    onClick={() => { 
                      updateDemand(p.id, 1); 
                      if (!favorites.includes(p.id)) toggleFavorite(p.id);
                      setShowAdd(false); 
                      setAddSearchTerm('');
                    }}
                    style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', padding: '12px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', color: 'var(--text-primary)', textAlign: 'left', width: '100%', transition: 'background 0.2s' }}
                  >
                    <span style={{ fontSize: '1.8rem' }}>{p.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '4px' }}>{t(p.name)}</div>
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
          {t('Your inventory is empty. Place orders on the Watchlist to stock up!')}
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table" style={{ margin: 0 }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)' }}>
                <th style={{ width: '30%' }}>{t('Product')}</th>
                <th style={{ width: '15%', textAlign: 'right' }}>{t('Target Demand')}</th>
                <th style={{ width: '15%', textAlign: 'right' }}>{t('Stock Count')}</th>
                <th style={{ width: '20%', textAlign: 'right' }}>{t('Current Price')}</th>
                <th style={{ width: '20%', textAlign: 'right' }}>{t('Total Value')}</th>
              </tr>
            </thead>
            <tbody>
              {businessAssets.map(asset => (
                <tr key={asset.id}>
                  <td>
                    <div className="table-icon-cell" style={{ maxWidth: '180px' }}>
                      <div className="ticker-icon" style={{ width: '32px', height: '32px', fontSize: '1rem', flexShrink: 0 }}>{asset.icon}</div>
                      <div style={{ minWidth: 0, overflow: 'hidden' }}>
                        <div style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t(asset.name)}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t(asset.category)}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <input 
                      type="number"
                      className="mono-nums"
                      value={asset.target || ''}
                      onChange={(e) => updateDemand(asset.id, Number(e.target.value) || 0)}
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
                        color: asset.count >= asset.target && asset.target > 0 ? 'var(--color-up)' : 'var(--text-primary)',
                        fontWeight: asset.count >= asset.target && asset.target > 0 ? 'bold' : 'normal'
                      }}
                    >{asset.count}</span>
                  </td>
                  <td className="mono-nums" style={{ textAlign: 'right' }}>{asset.currentLowest.toFixed(2)}€</td>
                  <td className="mono-nums" style={{ textAlign: 'right', fontWeight: 'bold' }}>{asset.totalValue.toFixed(2)}€</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
