import { useMarketSimulator } from '../hooks/useMarketSimulator';
import { SUPPLIERS } from '../data/mockData';

import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface Order {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  savings: number;
  timestamp: number;
  supplierId: string;
}

function Orders() {
  const { orders } = useMarketSimulator();
  const { t } = useLanguage();
  const { user } = useAuth();
  
  const currencySymbol = user?.currency === 'USD' ? '$' : '€';

  const totalSpent = orders.reduce((acc: number, o: Order) => acc + o.price * o.quantity, 0);
  const totalSaved = orders.reduce((acc: number, o: Order) => acc + o.savings, 0);

  return (
    <div className="page-content">
      <header style={{ margin: '-20px -20px 20px -20px', paddingBottom: '16px' }}>
        <h1 style={{ marginBottom: '16px', fontSize: '1.5rem' }}>{t('Portfolio Activity')}</h1>
      </header>

      {/* Dashboard Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
        <div className="card" style={{ marginBottom: 0, border: '1px solid var(--color-up)', background: 'var(--bg-secondary)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px' }}>{t('Total Savings')}</div>
          <div className="mono-nums text-up" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{totalSaved.toFixed(2)}{currencySymbol}</div>
        </div>
        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px' }}>{t('Total Spend')}</div>
          <div className="mono-nums" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{totalSpent.toFixed(2)}{currencySymbol}</div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>{user?.marketMode === 'real' ? t('Real Order History') : t('Recent Simulated Orders')}</h2>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
          {user?.marketMode === 'real' ? t('No real orders tracked yet.') : t('No simulated orders yet. Go to Watchlist to mock a purchase.')}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {orders.map((o: Order) => (
            <div key={o.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ minWidth: 0, overflow: 'hidden', flex: 1, marginRight: '16px' }}>
                <div style={{ fontWeight: 600, marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.productName} (x{o.quantity})</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {new Date(o.timestamp).toLocaleDateString()} &bull; <span className="supplier-chip" style={{ background: SUPPLIERS[o.supplierId]?.color, fontSize: '0.6rem' }}>{SUPPLIERS[o.supplierId]?.name}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="mono-nums" style={{ fontWeight: 600 }}>{(o.price * o.quantity).toFixed(2)}{currencySymbol}</div>
                {o.savings > 0 && (
                  <div className="mono-nums text-up" style={{ fontSize: '0.75rem' }}>{t('Saved ')}{o.savings.toFixed(2)}{currencySymbol}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;
