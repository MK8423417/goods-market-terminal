import { INITIAL_MARKET_STATE, PricePoint, SUPPLIERS, SIMULATED_PRODUCTS, REAL_PRODUCTS } from '../data/mockData';
import { PriceService } from '../services/PriceService';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

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
let realMetadata: Record<string, { 
  displayName: string, 
  thumbnail: string,
  brand?: string,
  packaging?: string,
  bulkPrice?: number,
  referenceFormat?: string,
  unitSize?: number,
  sizeFormat?: string,
  shareUrl?: string,
  origin?: string,
  categories?: string[],
  nutritionalInfo?: {
    energy_kcal?: number;
    energy_kj?: number;
    fat?: number;
    saturated_fat?: number;
    carbohydrates?: number;
    sugars?: number;
    proteins?: number;
    salt?: number;
  }
}> = {};
let subscribers: ((state: MarketState) => void)[] = [];
let isSyncing = false;
let syncSubscribers: ((status: boolean) => void)[] = [];

let currentTickSpeed = 3000;

const syncMercadonaPrices = async () => {
  if (isSyncing) return;
  
  isSyncing = true;
  syncSubscribers.forEach(cb => cb(true));
  
  try {
    const queries = REAL_PRODUCTS
      .filter(p => p.mercadonaQuery)
      .map(p => p.mercadonaQuery!);
    
    // Remote fetch
    const realPrices = await PriceService.fetchMultipleMercadonaPrices(queries);
    
    const now = Date.now();
    const newState = { ...sharedMarketState };
    let changed = false;

    REAL_PRODUCTS.forEach(p => {
      if (p.mercadonaQuery && realPrices[p.mercadonaQuery] !== undefined) {
        const mercDate = realPrices[p.mercadonaQuery];
        const newPrice = mercDate.price;
        
        // Store Real Metadata
        realMetadata[p.id] = { 
          displayName: mercDate.displayName, 
          thumbnail: mercDate.thumbnail,
          brand: mercDate.brand,
          packaging: mercDate.packaging,
          bulkPrice: mercDate.bulkPrice,
          referenceFormat: mercDate.referenceFormat,
          unitSize: mercDate.unitSize,
          sizeFormat: mercDate.sizeFormat,
          shareUrl: mercDate.shareUrl,
          origin: mercDate.origin,
          categories: mercDate.categories,
          nutritionalInfo: mercDate.nutritionalInfo
        };

        const history = [...(newState[p.id] || [])];
        const lastPoint = history.length > 0 ? history[history.length - 1] : null;
        
        // Only add a new point if the price actually changed or it's been a while,
        // or just force update the last point to be real.
        if (!lastPoint || lastPoint.mercadona !== newPrice) {
          changed = true;
          const newPoint: PricePoint = lastPoint 
            ? { ...lastPoint, time: now, mercadona: newPrice }
            : { time: now, mercadona: newPrice };
          
          Object.keys(SUPPLIERS).forEach(sId => {
            if (newPoint[sId] === undefined) {
              newPoint[sId] = lastPoint ? lastPoint[sId] : p.basePrice;
            }
          });

          history.push(newPoint);
          if (history.length > 2000) history.shift();
          newState[p.id] = history;
        }
      }
    });

    if (changed) {
      sharedMarketState = newState;
      subscribers.forEach(cb => cb(sharedMarketState));
    }
  } catch (error) {
    console.error("Failed to sync Mercadona prices:", error);
  } finally {
    isSyncing = false;
    syncSubscribers.forEach(cb => cb(false));
  }
};

const runSimulation = () => {
  try {
    const savedUser = localStorage.getItem('supplytrade_auth_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.tickSpeed) {
        currentTickSpeed = user.tickSpeed;
      }
    }
  } catch (e) {
    // default
  }

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
        // Only random walk non-mercadona suppliers
        // Mercadona is now "Real Data" only
        if (sId === 'mercadona') {
          newPoint[sId] = lastPoint[sId];
          return;
        }
        
        // Very small random walk (variance 0.01)
        const walk = 1 + (Math.random() * 0.01 - 0.005);
        newPoint[sId] = Number((lastPoint[sId] * walk).toFixed(2));
      });
      
      history.push(newPoint);
      // keep only last 2000 points
      if (history.length > 2000) history.shift();
      newState[productId] = history;
    }
  });

  if (changed) {
    sharedMarketState = newState;
    subscribers.forEach(cb => cb(sharedMarketState));
  }

  setTimeout(runSimulation, currentTickSpeed);
};

// Start simulation loop
runSimulation();

// Initial sync
setTimeout(syncMercadonaPrices, 1000);

// Periodically sync every 5 minutes to keep it "Real Data"
setInterval(syncMercadonaPrices, 5 * 60 * 1000);

export function useMarketSimulator() {
  const { user } = useAuth();
  const currentMode = user?.marketMode || 'simulation';
  const products = currentMode === 'real' ? REAL_PRODUCTS : SIMULATED_PRODUCTS;
  const suffix = currentMode === 'real' ? '_real' : '_sim';

  const [market, setMarket] = useState<MarketState>(sharedMarketState);
  const [syncStatus, setSyncStatus] = useState<boolean>(isSyncing);
  const [orders, setOrders] = useState<Order[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const [demand, setDemand] = useState<Record<string, number | ''>>({});

  useEffect(() => {
    const savedOrders = localStorage.getItem(`supplytrade_orders${suffix}`);
    setOrders(savedOrders ? JSON.parse(savedOrders) : []);
    
    const savedAlerts = localStorage.getItem(`supplytrade_alerts${suffix}`);
    setAlerts(savedAlerts ? JSON.parse(savedAlerts) : []);

    const savedFavs = localStorage.getItem(`supplytrade_favorites${suffix}`);
    setFavorites(savedFavs ? JSON.parse(savedFavs) : []);

    const savedInv = localStorage.getItem(`supplytrade_inventory${suffix}`);
    setInventory(savedInv ? JSON.parse(savedInv) : {});

    const savedDemand = localStorage.getItem(`supplytrade_demand${suffix}`);
    setDemand(savedDemand ? JSON.parse(savedDemand) : {});

    const handleSyncUpdate = (status: boolean) => setSyncStatus(status);
    syncSubscribers.push(handleSyncUpdate);

    const handleUpdate = (state: MarketState) => setMarket(state);
    subscribers.push(handleUpdate);
    return () => {
      subscribers = subscribers.filter(cb => cb !== handleUpdate);
      syncSubscribers = syncSubscribers.filter(cb => cb !== handleSyncUpdate);
    };
  }, [suffix]);

  const sync = useCallback(() => {
    syncMercadonaPrices();
  }, []);

  const placeOrder = useCallback((productId: string, supplierId: string, quantity: number, price: number, savings: number, productName: string) => {
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
      productId,
      supplierId,
      quantity,
      price,
      savings,
      productName,
      timestamp: Date.now()
    };
    setOrders((prev: Order[]) => {
      const updated = [newOrder, ...prev];
      localStorage.setItem(`supplytrade_orders${suffix}`, JSON.stringify(updated));
      return updated;
    });
    setInventory((prev: Record<string, number>) => {
      const updated = { ...prev, [productId]: (prev[productId] || 0) + quantity };
      localStorage.setItem(`supplytrade_inventory${suffix}`, JSON.stringify(updated));
      return updated;
    });
  }, [suffix]);

  const addAlert = useCallback((productId: string, targetPrice: number) => {
    const newAlert: Alert = { id: Math.random().toString(36).substr(2, 9), productId, targetPrice, active: true };
    setAlerts((prev: Alert[]) => {
      const updated = [...prev, newAlert];
      localStorage.setItem(`supplytrade_alerts${suffix}`, JSON.stringify(updated));
      return updated;
    });
  }, [suffix]);

  const toggleAlert = useCallback((id: string) => {
    setAlerts((prev: Alert[]) => {
      const updated = prev.map(a => a.id === id ? { ...a, active: !a.active } : a);
      localStorage.setItem(`supplytrade_alerts${suffix}`, JSON.stringify(updated));
      return updated;
    });
  }, [suffix]);
  
  const removeAlert = useCallback((id: string) => {
    setAlerts((prev: Alert[]) => {
      const updated = prev.filter((a: Alert) => a.id !== id);
      localStorage.setItem(`supplytrade_alerts${suffix}`, JSON.stringify(updated));
      return updated;
    });
  }, [suffix]);

  const toggleFavorite = useCallback((productId: string) => {
    setFavorites((prev: string[]) => {
      const updated = prev.includes(productId) 
        ? prev.filter((id: string) => id !== productId) 
        : [...prev, productId];
      localStorage.setItem(`supplytrade_favorites${suffix}`, JSON.stringify(updated));
      return updated;
    });
  }, [suffix]);

  const updateInventory = useCallback((productId: string, quantity: number) => {
    setInventory((prev: Record<string, number>) => {
      const updated = { ...prev, [productId]: quantity };
      localStorage.setItem(`supplytrade_inventory${suffix}`, JSON.stringify(updated));
      return updated;
    });
  }, [suffix]);

  const updateDemand = useCallback((productId: string, quantity: number | '') => {
    setDemand((prev: Record<string, number | ''>) => {
      const updated = { ...prev, [productId]: quantity };
      localStorage.setItem(`supplytrade_demand${suffix}`, JSON.stringify(updated));
      return updated;
    });
  }, [suffix]);

  const removeDemand = useCallback((productId: string) => {
    setDemand((prev: Record<string, number | ''>) => {
      const { [productId]: _, ...rest } = prev;
      localStorage.setItem(`supplytrade_demand${suffix}`, JSON.stringify(rest));
      return rest;
    });
  }, [suffix]);

  return { market, activeProducts: products, realMetadata, orders, alerts, favorites, inventory, demand, isSyncing: syncStatus, sync, placeOrder, addAlert, toggleAlert, removeAlert, toggleFavorite, updateInventory, updateDemand, removeDemand };
}
