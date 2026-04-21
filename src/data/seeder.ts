import { db } from './db';
import { REAL_PRODUCTS } from './mockData';

export const seedDatabase = async () => {
  // Purge all simulated data first to ensure a clean transition
  await purgeSimulatedData();

  const count = await db.products.count();
  console.log(`Database state: ${count} real products found.`);
  
  // Add missing real products
  const existingIds = new Set((await db.products.toCollection().primaryKeys()));
  const initialBatch = REAL_PRODUCTS.filter(p => !existingIds.has(p.id));
  if (initialBatch.length > 0) {
    console.log(`Seeding ${initialBatch.length} new real products...`);
    await db.products.bulkAdd(initialBatch);
  }

  // Clear all price history to ensure a clean slate with only authentic data (as requested)
  // This is a one-time cleanup to remove any lingering mock or inaccurate data
  const priceCount = await db.prices.count();
  if (priceCount > 0) {
    console.log(`Cleaning up ${priceCount} old price records for a 100% real data start...`);
    await db.prices.clear();
  }

  // Cleanup duplicates
  await cleanupDuplicates();
};

const purgeSimulatedData = async () => {
  console.log('Purging simulated/fake data...');
  const realIds = new Set(REAL_PRODUCTS.map(p => p.id));
  const allIds = await db.products.toCollection().primaryKeys() as string[];
  const toDelete = allIds.filter(id => !realIds.has(id));

  if (toDelete.length > 0) {
    console.log(`Deleting ${toDelete.length} simulated products...`);
    await db.products.bulkDelete(toDelete);
    
    // Cleanup associated data
    await db.prices.where('productId').anyOf(toDelete).delete();
    await db.favorites.where('productId').anyOf(toDelete).delete();
    await db.alerts.where('productId').anyOf(toDelete).delete();
    await db.inventory.where('productId').anyOf(toDelete).delete();
  }
};

const cleanupDuplicates = async () => {
  console.log('Enforcing 1:1 Mercadona mapping...');
  // Sort products to ensure base products (starting with 'p') are processed first
  const products = (await db.products.toArray()).sort((a, b) => a.id.localeCompare(b.id));
  const seenQueries = new Map<string, string>(); // query -> primaryItemId
  const toDelete: string[] = [];

  for (const p of products) {
    if (p.mercadonaQuery) {
      if (seenQueries.has(p.mercadonaQuery)) {
        toDelete.push(p.id);
      } else {
        seenQueries.set(p.mercadonaQuery, p.id);
      }
    }
  }

  if (toDelete.length > 0) {
    await db.products.bulkDelete(toDelete);
    await db.prices.where('productId').anyOf(toDelete).delete();
  }
};

// Function to add discovered products
export const addDiscoveredProducts = async (products: any[]) => {
  const existingIds = new Set((await db.products.toCollection().primaryKeys()));
  const newProducts = products.filter(p => !existingIds.has(p.id));
  
  if (newProducts.length > 0) {
    await db.products.bulkAdd(newProducts);
    return true;
  }
  return false;
};
