import Dexie, { type Table } from 'dexie';
import { type Product, type PricePoint } from './mockData';

export interface SyncMetadata {
  productId: string;
  lastSynced: number;
}

export interface InventoryItem {
  productId: string;
  quantity: number;
}

export interface dbAlert {
  id: string;
  productId: string;
  targetPrice: number;
  active: boolean;
}

export interface dbOrder {
  id: string;
  productId: string;
  productName: string;
  supplierId: string;
  price: number;
  quantity: number;
  timestamp: number;
  savings: number;
}

export interface dbDemand {
  productId: string;
  quantity: number | '';
}

export class GoodsMarketDB extends Dexie {
  products!: Table<Product>;
  prices!: Table<PricePoint & { productId: string }>;
  syncMetadata!: Table<SyncMetadata>;
  inventory!: Table<InventoryItem>;
  alerts!: Table<dbAlert>;
  orders!: Table<dbOrder>;
  favorites!: Table<{ productId: string }>;
  demand!: Table<dbDemand>;

  constructor() {
    super('GoodsMarketDB');
    this.version(5).stores({
      products: 'id, name, category, mercadonaQuery',
      prices: '[productId+time], productId, time',
      syncMetadata: 'productId, lastSynced',
      inventory: 'productId, quantity',
      alerts: 'id, productId, active',
      orders: 'id, productId, timestamp, supplierId',
      favorites: 'productId',
      demand: 'productId'
    });
  }
}

export const db = new GoodsMarketDB();
