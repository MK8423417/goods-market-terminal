/**
 * Service to fetch real-time product prices from Mercadona using their internal Algolia API.
 */

const ALGOLIA_APP_ID = '7UZJKL1DJ0';
const ALGOLIA_API_KEY = '9d8f2e39e90df472b4f2e559a116fe17';
const ALGOLIA_URL = `https://${ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/products_prod_vlc1_es/query`;

export interface MercadonaPrice {
  price: number;
  displayName: string;
  thumbnail: string;
  brand: string;
  packaging?: string;
  bulkPrice?: number;
  referenceFormat?: string;
  unitSize?: number;
  sizeFormat?: string;
  shareUrl?: string;
  origin?: string;
  categories?: string[];
  nutritionalInfo?: {
    energy_kcal?: number;
    energy_kj?: number;
    fat?: number;
    saturated_fat?: number;
    carbohydrates?: number;
    sugars?: number;
    proteins?: number;
    salt?: number;
  };
}

export const PriceService = {
  /**
   * Fetches the current price and details for a given query.
   */
  async fetchMercadonaPrice(query: string): Promise<MercadonaPrice | null> {
    try {
      const response = await fetch(ALGOLIA_URL, {
        method: 'POST',
        headers: {
          'x-algolia-application-id': ALGOLIA_APP_ID,
          'x-algolia-api-key': ALGOLIA_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          params: `query=${encodeURIComponent(query)}&hitsPerPage=1`,
        }),
      });

      if (!response.ok) {
        throw new Error(`Algolia API error: ${response.statusText}`);
      }

      const data = await response.json();
      const hit = data.hits?.[0];

      if (!hit) {
        return null;
      }

      // Extract unit price and instructions. 
      const priceInstr = hit.price_instructions || {};
      const price = parseFloat(priceInstr.unit_price || '0');

      return {
        price: price > 0 ? price : 0,
        displayName: hit.display_name,
        thumbnail: hit.thumbnail,
        brand: hit.brand,
        packaging: hit.packaging,
        bulkPrice: parseFloat(priceInstr.bulk_price || '0'),
        referenceFormat: priceInstr.reference_format,
        unitSize: priceInstr.unit_size,
        sizeFormat: priceInstr.size_format,
        shareUrl: hit.share_url,
        origin: hit.origin,
        categories: (hit.categories || []).map((c: any) => typeof c === 'string' ? c : (c.name || '')).filter(Boolean),
        nutritionalInfo: hit.nutritional_info ? {
          energy_kcal: hit.nutritional_info.energy_kcal,
          energy_kj: hit.nutritional_info.energy_kj,
          fat: hit.nutritional_info.fat,
          saturated_fat: hit.nutritional_info.saturated_fat,
          carbohydrates: hit.nutritional_info.carbohydrates,
          sugars: hit.nutritional_info.sugars,
          proteins: hit.nutritional_info.proteins,
          salt: hit.nutritional_info.salt
        } : (hit.nutrition_info ? { // Some variants might use nutrition_info
            energy_kcal: hit.nutrition_info.energy_kcal,
            fat: hit.nutrition_info.fat,
            carbohydrates: hit.nutrition_info.carbohydrates,
            proteins: hit.nutrition_info.proteins,
            salt: hit.nutrition_info.salt
        } : undefined)
      };
    } catch (error) {
      console.error(`Failed to fetch Mercadona price for "${query}":`, error);
      return null;
    }
  },

  /**
   * Batch fetches prices for multiple products.
   */
  async fetchMultipleMercadonaPrices(queries: string[]): Promise<Record<string, MercadonaPrice>> {
    const results: Record<string, MercadonaPrice> = {};
    
    // We do them sequentially or in small chunks to avoid being flagged, 
    // although Algolia keys are usually high-capacity.
    const promises = queries.map(async (query) => {
      const data = await this.fetchMercadonaPrice(query);
      if (data) {
        results[query] = data;
      }
    });

    await Promise.all(promises);
    return results;
  }
};
