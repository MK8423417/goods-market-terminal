import { useState, useEffect, useCallback } from 'react';
import { INITIAL_MARKET_STATE, PricePoint, SUPPLIERS } from '../data/mockData';

export type MarketState = Record<string, PricePoint[]>;

export interface Order {
  id: string;
  productId: string;
  productName: string;
  supplierId: string;
  price: number;
  quantity: number;
  timestamp: number;
  savings: number;
}

export interface Alert {
  id: string;
  productId: string;
  targetPrice: number;
  active: boolean;
}

let sharedMarketState = { ...INITIAL_MARKET_STATE };
let subscribers: ((state: MarketState) => void)[] = [];

// Tick the prices every 3 seconds for simulation
setInterval(() => {
  const now = Date.now();
  const newState = { ...sharedMarketState };
  let changed = false;

  Object.keys(newState).forEach(productId => {
    // 30% chance for a product to tick every interval
    if (Math.random() < 0.3) {
      changed = true;
      const history = [...newState[productId]];
      const lastPoint = { ...history[history.length - 1] };
      const newPoint: PricePoint = { time: now };
      
      Object.keys(SUPPLIERS).forEach(sId => {
        // Very small random walk (variance 0.005)
        const walk = 1 + (Math.random() * 0.01 - 0.005);
        newPoint[sId] = Number((lastPoint[sId] * walk).toFixed(2));
      });
      
      history.push(newPoint);
      // keep only last 2000 points (prevents 1Y data from being purged too quickly by 3s ticks)
      if (history.length > 2000) history.shift();
      newState[productId] = history;
    }
  });

  if (changed) {
    sharedMarketState = newState;
    subscribers.forEach(cb => cb(sharedMarketState));
  }
}, 3000);

export function useMarketSimulator() {
  const [market, setMarket] = useState<MarketState>(sharedMarketState);
  const [orders, setOrders] = useState<Order[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const [demand, setDemand] = useState<Record<string, number | ''>>({});

  useEffect(() => {
    const savedOrders = localStorage.getItem('supplytrade_orders');
    if (savedOrders) setOrders(JSON.parse(savedOrders));
    
    const savedAlerts = localStorage.getItem('supplytrade_alerts');
    if (savedAlerts) setAlerts(JSON.parse(savedAlerts));

    const savedFavs = localStorage.getItem('supplytrade_favorites');
    if (savedFavs) setFavorites(JSON.parse(savedFavs));

    const savedInv = localStorage.getItem('supplytrade_inventory');
    if (savedInv) setInventory(JSON.parse(savedInv));

    const savedDemand = localStorage.getItem('supplytrade_demand');
    if (savedDemand) setDemand(JSON.parse(savedDemand));

    const handleUpdate = (state: MarketState) => setMarket(state);
    subscribers.push(handleUpdate);
    return () => {
      subscribers = subscribers.filter(cb => cb !== handleUpdate);
    };
  }, []);

  const placeOrder = useCallback((order: Omit<Order, 'id' | 'timestamp'>) => {
    const newOrder = {
      ...order,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    };
    setOrders(prev => {
      const updated = [newOrder, ...prev];
      localStorage.setItem('supplytrade_orders', JSON.stringify(updated));
      return updated;
    });

    setInventory(prev => {
      const updated = { ...prev };
      updated[order.productId] = (updated[order.productId] || 0) + order.quantity;
      localStorage.setItem('supplytrade_inventory', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addAlert = useCallback((alert: Omit<Alert, 'id'>) => {
    const newAlert = {
      ...alert,
      id: Math.random().toString(36).substr(2, 9)
    };
    setAlerts(prev => {
      const updated = [newAlert, ...prev];
      localStorage.setItem('supplytrade_alerts', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const toggleAlert = useCallback((id: string) => {
    setAlerts(prev => {
      const updated = prev.map(a => a.id === id ? { ...a, active: !a.active } : a);
      localStorage.setItem('supplytrade_alerts', JSON.stringify(updated));
      return updated;
    });
  }, []);
  
  const removeAlert = useCallback((id: string) => {
    setAlerts(prev => {
      const updated = prev.filter(a => a.id !== id);
      localStorage.setItem('supplytrade_alerts', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const toggleFavorite = useCallback((productId: string) => {
    setFavorites(prev => {
      const updated = prev.includes(productId) 
        ? prev.filter(id => id !== productId) 
        : [...prev, productId];
      localStorage.setItem('supplytrade_favorites', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateInventory = useCallback((productId: string, quantity: number) => {
    setInventory(prev => {
      const updated = { ...prev, [productId]: quantity };
      localStorage.setItem('supplytrade_inventory', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateDemand = useCallback((productId: string, quantity: number | '') => {
    setDemand(prev => {
      const updated = { ...prev, [productId]: quantity };
      localStorage.setItem('supplytrade_demand', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeDemand = useCallback((productId: string) => {
    setDemand(prev => {
      const updated = { ...prev };
      delete updated[productId];
      localStorage.setItem('supplytrade_demand', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { market, orders, alerts, favorites, inventory, demand, placeOrder, addAlert, toggleAlert, removeAlert, toggleFavorite, updateInventory, updateDemand, removeDemand };
}
