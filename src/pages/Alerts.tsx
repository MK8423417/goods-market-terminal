import { useMarketSimulator } from '../hooks/useMarketSimulator';
import { SUPPLIERS } from '../data/mockData';
import { BellOff } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

function Alerts() {
  const { alerts, removeAlert, toggleAlert, market, activeProducts } = useMarketSimulator();
  const { t } = useLanguage();
  const { user } = useAuth();
  
  const currencySymbol = user?.currency === 'USD' ? '$' : '€';

  return (
    <div className="page-content">
      <header style={{ margin: '-20px -20px 20px -20px', paddingBottom: '16px' }}>
        <h1 style={{ marginBottom: '16px', fontSize: '1.5rem' }}>{t('Price Alerts')}</h1>
      </header>

      {alerts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
          <BellOff size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
          <div>{t('No active alerts.')}</div>
          <div style={{ fontSize: '0.9rem', marginTop: '8px' }}>{t('Set alerts from product detail pages.')}</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {alerts.map((a: { id: string, productId: string, targetPrice: number, active: boolean }) => {
            const p = activeProducts.find(prod => prod?.id === a.productId);
            if (!p) return null;
            
            // Current price logic for comparison
            const history = market[a.productId] || [];
            let currentPrice = 0;
            if (history.length > 0) {
              const cp = history[history.length - 1];
              const prices = Object.keys(SUPPLIERS)
                .map(s => cp[s as keyof typeof cp] as number)
                .filter(pr => pr !== undefined && pr !== null);
              currentPrice = prices.length > 0 ? Math.min(...prices) : 0;
            }

            const isTriggered = currentPrice > 0 && currentPrice <= a.targetPrice;

            return (
              <div key={a.id} className="card" style={{ opacity: a.active ? 1 : 0.6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ minWidth: 0, flex: 1, marginRight: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', minWidth: 0, overflow: 'hidden' }}>
                    {p.realThumbnail ? (
                      <img src={p.realThumbnail} alt="" style={{ width: '24px', height: '24px', borderRadius: '4px', background: '#fff' }} />
                    ) : (
                      <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{p.icon}</span>
                    )}
                    <span style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.displayName || t(p.name)}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {t('Target')}: <span className="mono-nums" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{a.targetPrice.toFixed(2)}{currencySymbol}</span>
                    <span style={{ margin: '0 8px' }}>&bull;</span>
                    {t('Current')}: <span className="mono-nums" style={{ color: isTriggered && a.active ? 'var(--color-up)' : 'var(--text-secondary)' }}>{currentPrice.toFixed(2)}{currencySymbol}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button onClick={() => toggleAlert(a.id)} style={{ padding: '8px 12px', borderRadius: '16px', border: '1px solid var(--border-color)', background: a.active ? 'var(--bg-secondary)' : 'transparent', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--text-primary)' }}>
                    {a.active ? t('Pause') : t('Resume')}
                  </button>
                  <button onClick={() => removeAlert(a.id)} style={{ padding: '8px', color: 'var(--color-down)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                    {t('Remove')}
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
