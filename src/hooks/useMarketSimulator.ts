import { PricePoint, SUPPLIERS, Category } from '../data/mockData';
import { PriceService } from '../services/PriceService';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '../data/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { seedDatabase } from '../data/seeder';

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



let isSyncingGlobal = false;
let syncSubscribers: ((status: boolean) => void)[] = [];

const syncMercadonaPrices = async (targetProductIds: string[]) => {
  if (isSyncingGlobal || targetProductIds.length === 0) return;
  
  const now = Date.now();
  const meta = await db.syncMetadata.where('productId').anyOf(targetProductIds).toArray();
  const metaMap = new Map(meta.map(m => [m.productId, m.lastSynced]));

  const productsToSync = await db.products
    .where('id').anyOf(targetProductIds)
    .filter(p => !p.mercadonaQuery || (now - (metaMap.get(p.id) || 0) > 10 * 60 * 1000))
    .toArray();

  if (productsToSync.length === 0) return;

  isSyncingGlobal = true;
  syncSubscribers.forEach(cb => cb(true));
  
  try {
    const queries = productsToSync.map(p => p.mercadonaQuery).filter(Boolean) as string[];
    const realPrices = await PriceService.fetchMultipleMercadonaPrices(queries);
    
    for (const p of productsToSync) {
      if (p.mercadonaQuery && realPrices[p.mercadonaQuery] !== undefined) {
        const mercData = realPrices[p.mercadonaQuery];
        const newPrice = mercData.price;
        
        const lastPoint = await db.prices
          .where('productId').equals(p.id)
          .reverse()
          .first();

        const hourMs = 60 * 60 * 1000;
        const shouldSave = !lastPoint || 
                          lastPoint.mercadona !== newPrice || 
                          (now - lastPoint.time > hourMs);

        if (shouldSave) {
          const newPoint: any = {
            productId: p.id,
            time: now,
            mercadona: newPrice
          };

          // For authentic history, we only backfill other suppliers if we are in simulation mode.
          // Since we are transitioning to real data, we keep the mercadona value as the truth.
          Object.keys(SUPPLIERS).forEach(sId => {
            if (sId !== 'mercadona') {
              newPoint[sId] = lastPoint ? (lastPoint[sId] as any) : p.basePrice;
            }
          });

          await db.prices.add(newPoint);
          
          const historyCount = await db.prices.where('productId').equals(p.id).count();
          if (historyCount > 100) {
            const olderPoints = await db.prices.where('productId').equals(p.id).limit(historyCount - 100).toArray();
            await db.prices.bulkDelete(olderPoints.map(op => [op.productId, op.time]));
          }
        }

        await db.syncMetadata.put({ productId: p.id, lastSynced: now });

        if (mercData.displayName || mercData.thumbnail || mercData.shareUrl) {
          await db.products.update(p.id, { 
            displayName: mercData.displayName || p.displayName || p.name,
            realThumbnail: mercData.thumbnail || p.realThumbnail || (p.icon.startsWith('http') ? p.icon : undefined),
            shareUrl: mercData.shareUrl || p.shareUrl
          });
        }
      }
    }
  } catch (error) {
    console.error("Failed to sync Mercadona prices:", error);
  } finally {
    isSyncingGlobal = false;
    syncSubscribers.forEach(cb => cb(false));
  }
};

export function useMarketSimulator() {
  const [syncStatus, setSyncStatus] = useState<boolean>(isSyncingGlobal);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    seedDatabase().catch(console.error);
  }, []);

  // Reactive queries
  const allProducts = useLiveQuery(() => db.products.toArray()) || [];
  const activeProducts = useMemo(() => allProducts.filter((p): p is any => !!p), [allProducts]);
  
  const allPrices = useLiveQuery(() => db.prices.toArray()) || [];
  const market = useMemo(() => {
    const map: MarketState = {};
    allPrices.forEach(p => {
      if (!map[p.productId]) map[p.productId] = [];
      map[p.productId].push(p as any);
    });
    return map;
  }, [allPrices]);

  const orders = useLiveQuery(() => db.orders.reverse().toArray()) || [];
  const alerts = useLiveQuery(() => db.alerts.toArray()) || [];
  const favoritesResults = useLiveQuery(() => db.favorites.toArray()) || [];
  const favorites = useMemo(() => favoritesResults.map(f => f.productId), [favoritesResults]);
  const inventoryResults = useLiveQuery(() => db.inventory.toArray()) || [];
  const inventory = useMemo(() => {
    const map: Record<string, number> = {};
    inventoryResults.forEach(item => { map[item.productId] = item.quantity; });
    return map;
  }, [inventoryResults]);
  const demandResults = useLiveQuery(() => db.demand.toArray()) || [];
  const demand = useMemo(() => {
    const map: Record<string, number | ''> = {};
    demandResults.forEach(item => { map[item.productId] = item.quantity; });
    return map;
  }, [demandResults]);

  useEffect(() => {
    const handleSyncUpdate = (status: boolean) => setSyncStatus(status);
    syncSubscribers.push(handleSyncUpdate);
    return () => {
      syncSubscribers = syncSubscribers.filter(cb => cb !== handleSyncUpdate);
    };
  }, []);

  const sync = useCallback(async () => {
    if (favorites.length > 0) {
      await syncMercadonaPrices(favorites);
    }
  }, [favorites]);

  const syncVisibleProducts = useCallback((productIds: string[]) => {
    syncMercadonaPrices(productIds);
  }, []);

  const placeOrder = useCallback(async (productId: string, supplierId: string, quantity: number, price: number, savings: number, productName: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    await db.orders.add({
      id, productId, supplierId, quantity, price, savings, productName,
      timestamp: Date.now()
    });
    
    const existing = await db.inventory.get(productId);
    await db.inventory.put({
      productId,
      quantity: (existing?.quantity || 0) + quantity
    });
  }, []);

  const toggleFavorite = useCallback(async (productId: string) => {
    const exists = await db.favorites.get({ productId });
    if (exists) {
      await db.favorites.delete(productId);
    } else {
      await db.favorites.add({ productId });
    }
  }, []);

  const updateInventory = useCallback(async (productId: string, quantity: number) => {
    await db.inventory.put({ productId, quantity });
  }, []);

  const addAlert = useCallback(async (productId: string, targetPrice: number) => {
    const id = Math.random().toString(36).substr(2, 9);
    await db.alerts.add({ id, productId, targetPrice, active: true });
  }, []);

  const toggleAlert = useCallback(async (id: string) => {
    const alert = await db.alerts.get(id);
    if (alert) {
      await db.alerts.update(id, { active: !alert.active });
    }
  }, []);
  
  const removeAlert = useCallback(async (id: string) => {
    await db.alerts.delete(id);
  }, []);

  const updateDemand = useCallback(async (productId: string, quantity: number | '') => {
    await db.demand.put({ productId, quantity });
  }, []);

  const removeDemand = useCallback(async (productId: string) => {
    await db.demand.delete(productId);
  }, []);

  const globalSearch = useCallback(async (query: string) => {
    if (!query || query.trim().length === 0) return;
    
    setSyncStatus(true);
    try {
      const results = await PriceService.searchMercadona(query);
      if (results.length > 0) {
        // Add new products to our local database if they don't exist
        for (const item of results) {
          const existing = await db.products.where('mercadonaQuery').equals(item.displayName).first();
          if (!existing) {
            const newId = `p_disc_${Math.random().toString(36).substr(2, 9)}`;
            await db.products.add({
              id: newId,
              name: item.displayName,
              displayName: item.displayName,
              category: (item.categories?.[0] as Category) || 'Despensa',
              unit: item.packaging || 'ud',
              icon: item.thumbnail || '🛒',
              basePrice: item.price,
              mercadonaQuery: item.displayName,
              realThumbnail: item.thumbnail,
              shareUrl: item.shareUrl
            });

            // Add initial price point
            await db.prices.add({
              productId: newId,
              time: Date.now(),
              mercadona: item.price
            } as any);
          }
        }
      }
    } catch (err) {
      console.error("Global search failed:", err);
    } finally {
      setSyncStatus(false);
    }
  }, []);

  // Automatic global search if local results are zero
  useEffect(() => {
    if (searchQuery.trim().length >= 3 && !syncStatus) {
      const s = searchQuery.toLowerCase();
      const localHits = activeProducts.filter(p => 
        p.displayName?.toLowerCase().includes(s) || p.name.toLowerCase().includes(s)
      );

      if (localHits.length === 0) {
        const timer = setTimeout(() => {
          globalSearch(searchQuery);
        }, 1000); // 1s debounce for auto-search
        return () => clearTimeout(timer);
      }
    }
  }, [searchQuery, activeProducts, globalSearch, syncStatus]);

  return { 
    market, 
    activeProducts, 
    orders, alerts, favorites, inventory, demand, 
    isSyncing: syncStatus, 
    sync, syncVisibleProducts, placeOrder, toggleFavorite, updateInventory,
    addAlert, toggleAlert, removeAlert, updateDemand, removeDemand,
    searchQuery, setSearchQuery, globalSearch
  };
}
