import React, { useMemo, useState } from 'react';
import { useMarketSimulator } from '../hooks/useMarketSimulator';
import { BASE_PRODUCTS } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';

export default function MyBusiness() {
  const { t } = useLanguage();
  const { market, inventory, updateInventory } = useMarketSimulator();
  const [showAdd, setShowAdd] = useState(false);

  // Combine products with their current valuation and inventory counts
  const businessAssets = useMemo(() => {
    return BASE_PRODUCTS
      .filter(p => inventory[p.id] && inventory[p.id] > 0)
      .map(p => {
        const prices = market[p.id];
        let currentLowest = p.basePrice;
        if (prices && prices.length > 0) {
          const latest = prices[prices.length - 1];
          const vals = Object.values(latest).filter(v => typeof v === 'number') as number[];
          if (vals.length > 0) currentLowest = Math.min(...vals);
        }
        const count = inventory[p.id] || 0;
        const totalValue = count * currentLowest;

        return {
          ...p,
          currentLowest,
          count,
          totalValue
        };
      })
      .sort((a, b) => b.totalValue - a.totalValue);
  }, [market, inventory]);

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
          <div className="pill-scroll" style={{ marginTop: '16px', paddingBottom: '4px' }}>
            {BASE_PRODUCTS.filter(p => !inventory[p.id] || inventory[p.id] === 0).map(p => (
              <button 
                key={p.id}
                onClick={() => { updateInventory(p.id, 1); setShowAdd(false); }}
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}
              >
                <span>{p.icon}</span>
                <span style={{ fontWeight: 500, fontSize: '0.85rem' }}>{t(p.name)}</span>
              </button>
            ))}
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
                <th style={{ width: '40%' }}>{t('Product')}</th>
                <th style={{ width: '20%', textAlign: 'right' }}>{t('Stock Count')}</th>
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
                      value={asset.count || ''}
                      onChange={(e) => updateInventory(asset.id, Number(e.target.value) || 0)}
                      style={{ 
                        width: '80px', 
                        textAlign: 'right', 
                        padding: '6px', 
                        borderRadius: '6px', 
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-color)',
                        color: 'var(--text-primary)'
                      }}
                    />
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
