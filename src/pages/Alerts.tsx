import React from 'react';
import { useMarketSimulator } from '../hooks/useMarketSimulator';
import { PRODUCTS, SUPPLIERS } from '../data/mockData';
import { BellOff } from 'lucide-react';

function Alerts() {
  const { alerts, removeAlert, toggleAlert, market } = useMarketSimulator();

  return (
    <div className="page-content">
      <header style={{ margin: '-20px -20px 20px -20px', paddingBottom: '16px' }}>
        <h1 style={{ marginBottom: '16px', fontSize: '1.5rem' }}>Price Alerts</h1>
      </header>

      {alerts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
          <BellOff size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
          <div>No active alerts.</div>
          <div style={{ fontSize: '0.9rem', marginTop: '8px' }}>Set alerts from product detail pages.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {alerts.map(a => {
            const p = PRODUCTS.find(prod => prod.id === a.productId);
            if (!p) return null;
            
            // Current price logic for comparison
            const history = market[a.productId] || [];
            let currentPrice = 0;
            if (history.length > 0) {
              const cp = history[history.length - 1];
              currentPrice = Math.min(...Object.keys(SUPPLIERS).map(s => cp[s]));
            }

            const isTriggered = currentPrice <= a.targetPrice;

            return (
              <div key={a.id} className="card" style={{ opacity: a.active ? 1 : 0.6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', minWidth: 0, overflow: 'hidden' }}>
                    <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{p.icon}</span>
                    <span style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Target: <span className="mono-nums" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{a.targetPrice.toFixed(2)}€</span>
                    <span style={{ margin: '0 8px' }}>&bull;</span>
                    Current: <span className="mono-nums" style={{ color: isTriggered && a.active ? 'var(--color-up)' : 'var(--text-secondary)' }}>{currentPrice.toFixed(2)}€</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => toggleAlert(a.id)} style={{ padding: '8px 12px', borderRadius: '16px', border: '1px solid var(--border-color)', background: a.active ? 'var(--bg-secondary)' : 'transparent', fontSize: '0.8rem', cursor: 'pointer' }}>
                    {a.active ? 'Pause' : 'Resume'}
                  </button>
                  <button onClick={() => removeAlert(a.id)} style={{ padding: '8px', color: 'var(--color-down)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Alerts;
