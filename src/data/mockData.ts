export type Category = 'Lácteos' | 'Panadería' | 'Aceites' | 'Carnes' | 'Bebidas' | 'Despensa' | 'Pescadería';

export interface Supplier {
  id: string;
  name: string;
  color: string;
  logo?: string;
}

export interface Product {
  id: string;
  name: string;
  category: Category;
  unit: string;
  icon: string;
  basePrice: number;
  mercadonaQuery?: string;
}

export interface PricePoint {
  time: number;
  [supplierId: string]: number; // key is supplier id, value is price
}

export const SUPPLIERS: Record<string, Supplier> = {
  mercadona: { id: 'mercadona', name: 'Mercadona', color: '#00824E', logo: 'https://www.google.com/s2/favicons?domain=mercadona.es&sz=128' },
  dia: { id: 'dia', name: 'Dia', color: '#D6002A', logo: 'https://www.google.com/s2/favicons?domain=dia.es&sz=128' },
  lidl: { id: 'lidl', name: 'Lidl', color: '#0050AA', logo: 'https://www.google.com/s2/favicons?domain=lidl.es&sz=128' },
  carrefour: { id: 'carrefour', name: 'Carrefour', color: '#004C99', logo: 'https://www.google.com/s2/favicons?domain=carrefour.es&sz=128' },
  alcampo: { id: 'alcampo', name: 'Alcampo', color: '#E30613', logo: 'https://www.google.com/s2/favicons?domain=alcampo.es&sz=128' },
  aldi: { id: 'aldi', name: 'Aldi', color: '#0000FF', logo: 'https://www.google.com/s2/favicons?domain=aldi.es&sz=128' },
  eroski: { id: 'eroski', name: 'Eroski', color: '#0054A6', logo: 'https://www.google.com/s2/favicons?domain=eroski.es&sz=128' },
  consum: { id: 'consum', name: 'Consum', color: '#F18E00', logo: 'https://www.google.com/s2/favicons?domain=consum.es&sz=128' },
  ahorramas: { id: 'ahorramas', name: 'Ahorramas', color: '#FFD100', logo: 'https://www.google.com/s2/favicons?domain=ahorramas.com&sz=128' },
  coviran: { id: 'coviran', name: 'Coviran', color: '#009739', logo: 'https://www.google.com/s2/favicons?domain=coviran.es&sz=128' },
  froiz: { id: 'froiz', name: 'Froiz', color: '#ED1C24', logo: 'https://www.google.com/s2/favicons?domain=froiz.com&sz=128' },
  bonpreu: { id: 'bonpreu', name: 'Bonpreu', color: '#E85B22', logo: 'https://www.google.com/s2/favicons?domain=bonpreuesclat.cat&sz=128' },
  gadis: { id: 'gadis', name: 'Gadis', color: '#005BBB', logo: 'https://www.google.com/s2/favicons?domain=gadis.es&sz=128' },
  hipercor: { id: 'hipercor', name: 'Hipercor', color: '#008C45', logo: 'https://www.google.com/s2/favicons?domain=hipercor.es&sz=128' }
};

export const BASE_PRODUCTS: Product[] = [
  // Original 20
  { id: 'p1', name: 'Huevos L', category: 'Lácteos', unit: 'docena', icon: '🥚', basePrice: 2.15, mercadonaQuery: 'Huevos L' },
  { id: 'p2', name: 'Leche Entera', category: 'Lácteos', unit: '1L', icon: '🥛', basePrice: 0.89, mercadonaQuery: 'Leche entera Hacendado' },
  { id: 'p3', name: 'Pan de Molde', category: 'Panadería', unit: '460g', icon: '🍞', basePrice: 1.25, mercadonaQuery: 'Pan molde Hacendado' },
  { id: 'p4', name: 'Aceite Olive VE', category: 'Aceites', unit: '1L', icon: '🫒', basePrice: 8.95, mercadonaQuery: 'Aceite oliva virgen extra 1L' },
  { id: 'p5', name: 'Arroz Redondo', category: 'Despensa', unit: '1kg', icon: '🍚', basePrice: 1.30, mercadonaQuery: 'Arroz redondo Hacendado' },
  { id: 'p6', name: 'Pasta Macarrones', category: 'Despensa', unit: '500g', icon: '🍝', basePrice: 0.80, mercadonaQuery: 'Macarrones Hacendado' },
  { id: 'p7', name: 'Pechuga Pollo', category: 'Carnes', unit: '1kg', icon: '🍗', basePrice: 6.50, mercadonaQuery: 'Pechuga pollo' },
  { id: 'p8', name: 'Atún Claro', category: 'Pescadería', unit: 'pack-3', icon: '🐟', basePrice: 2.95, mercadonaQuery: 'Atun claro Hacendado pack-3' },
  { id: 'p9', name: 'Azúcar Blanco', category: 'Despensa', unit: '1kg', icon: '🧁', basePrice: 1.45, mercadonaQuery: 'Azucar blanco' },
  { id: 'p10', name: 'Café Molido', category: 'Despensa', unit: '250g', icon: '☕', basePrice: 2.70, mercadonaQuery: 'Cafe molido natural Hacendado' },
  { id: 'p11', name: 'Cerveza Lager', category: 'Bebidas', unit: '33cl', icon: '🍺', basePrice: 0.40, mercadonaQuery: 'Cerveza suave Steinburg' },
  { id: 'p12', name: 'Agua Mineral', category: 'Bebidas', unit: '1.5L', icon: '💧', basePrice: 0.25, mercadonaQuery: 'Agua mineral 1.5L' },
  { id: 'p13', name: 'Queso Gouda', category: 'Lácteos', unit: '300g', icon: '🧀', basePrice: 2.80, mercadonaQuery: 'Queso Gouda lonchas' },
  { id: 'p14', name: 'Tomate Frito', category: 'Despensa', unit: '390g', icon: '🍅', basePrice: 0.65, mercadonaQuery: 'Tomate frito Hacendado' },
  { id: 'p15', name: 'Carne Picada', category: 'Carnes', unit: '400g', icon: '🥩', basePrice: 3.50, mercadonaQuery: 'Carne picada vacuno cerdo' },
  { id: 'p16', name: 'Mantequilla', category: 'Lácteos', unit: '250g', icon: '🧈', basePrice: 2.10, mercadonaQuery: 'Mantequilla con sal' },
  { id: 'p17', name: 'Cebollas', category: 'Despensa', unit: '1kg', icon: '🧅', basePrice: 1.65, mercadonaQuery: 'Cebollas' },
  { id: 'p18', name: 'Patatas', category: 'Despensa', unit: '3kg', icon: '🥔', basePrice: 3.60, mercadonaQuery: 'Patatas 3kg' },
  { id: 'p19', name: 'Harina Trigo', category: 'Despensa', unit: '1kg', icon: '🌾', basePrice: 0.75, mercadonaQuery: 'Harina de trigo' },
  { id: 'p20', name: 'Sal Fina', category: 'Despensa', unit: '1kg', icon: '🧂', basePrice: 0.35, mercadonaQuery: 'Sal fina' },
  
  // New 20+ Expansion
  { id: 'p21', name: 'Plátano Canarias', category: 'Despensa', unit: 'ud', icon: '🍌', basePrice: 0.38, mercadonaQuery: 'Plátano de Canarias IGP' },
  { id: 'p22', name: 'Banana', category: 'Despensa', unit: 'ud', icon: '🍌', basePrice: 0.28, mercadonaQuery: 'Banana' },
  { id: 'p23', name: 'Leche Desnatada', category: 'Lácteos', unit: '1L', icon: '🥛', basePrice: 0.89, mercadonaQuery: 'Leche desnatada Hacendado' },
  { id: 'p24', name: 'Leche Semidesnat.', category: 'Lácteos', unit: '1L', icon: '🥛', basePrice: 0.89, mercadonaQuery: 'Leche semidesnatada Hacendado' },
  { id: 'p25', name: 'Grapes White', category: 'Despensa', unit: '600g', icon: '🍇', basePrice: 3.30, mercadonaQuery: 'Uva blanca sin semillas' },
  { id: 'p26', name: 'Arroz Basmati', category: 'Despensa', unit: '1kg', icon: '🍚', basePrice: 2.10, mercadonaQuery: 'Arroz basmati Hacendado' },
  { id: 'p27', name: 'Huevos Camperos', category: 'Lácteos', unit: 'docena', icon: '🥚', basePrice: 3.50, mercadonaQuery: 'Huevos de gallinas camperas' },
  { id: 'p28', name: 'Yogur Natural', category: 'Lácteos', unit: '6x125g', icon: '🍦', basePrice: 1.20, mercadonaQuery: 'Yogur natural Hacendado' },
  { id: 'p29', name: 'Queso Rallado', category: 'Lácteos', unit: '200g', icon: '🧀', basePrice: 1.85, mercadonaQuery: 'Queso rallado 4 quesos' },
  { id: 'p30', name: 'Detergente Ropa', category: 'Despensa', unit: '3L', icon: '🧼', basePrice: 4.50, mercadonaQuery: 'Detergent liquido Marsella' },
  { id: 'p31', name: 'Lavavajillas', category: 'Despensa', unit: '1L', icon: '🧽', basePrice: 1.25, mercadonaQuery: 'Lavavajillas concentrado ultra' },
  { id: 'p32', name: 'Coca-Cola', category: 'Bebidas', unit: '1.5L', icon: '🥤', basePrice: 1.85, mercadonaQuery: 'Coca-Cola sabor original' },
  { id: 'p33', name: 'Fanta Naranja', category: 'Bebidas', unit: '1.5L', icon: '🍊', basePrice: 1.50, mercadonaQuery: 'Fanta naranja' },
  { id: 'p34', name: 'Vino Tinto', category: 'Bebidas', unit: '75cl', icon: '🍷', basePrice: 3.20, mercadonaQuery: 'Vino tinto Rioja' },
  { id: 'p35', name: 'Galletas María', category: 'Panadería', unit: '800g', icon: '🍪', basePrice: 1.95, mercadonaQuery: 'Galletas Maria Hacendado' },
  { id: 'p36', name: 'Patatas Fritas', category: 'Despensa', unit: '150g', icon: '🍟', basePrice: 1.10, mercadonaQuery: 'Patatas fritas lisas' },
  { id: 'p37', name: 'Pizza Jamón', category: 'Carnes', unit: '400g', icon: '🍕', basePrice: 2.60, mercadonaQuery: 'Pizza jamon y queso' },
  { id: 'p38', name: 'Helado Vainilla', category: 'Lácteos', unit: '1L', icon: '🍦', basePrice: 2.85, mercadonaQuery: 'Helado vainilla Hacendado' },
  { id: 'p39', name: 'Manzana Roja', category: 'Despensa', unit: '1kg', icon: '🍎', basePrice: 2.20, mercadonaQuery: 'Manzana roja' },
  { id: 'p40', name: 'Zanahorias', category: 'Despensa', unit: '1kg', icon: '🥕', basePrice: 0.90, mercadonaQuery: 'Zanahorias' },
  { id: 'p41', name: 'Lechuga Iceberg', category: 'Despensa', unit: 'ud', icon: '🥬', basePrice: 0.95, mercadonaQuery: 'Lechuga iceberg' },
  { id: 'p42', name: 'Pescada Filetes', category: 'Pescadería', unit: '400g', icon: '🐟', basePrice: 5.80, mercadonaQuery: 'Filetes merluza sin piel' },
];

// 20 products for Real Mode (Mercadona focus)
export const REAL_PRODUCTS: Product[] = [...BASE_PRODUCTS];

// 200 products for Simulated Mode
export const SIMULATED_PRODUCTS: Product[] = [];
for (let i = 0; i < 10; i++) {
  BASE_PRODUCTS.forEach((bp) => {
     let variantName = bp.name;
     if (i > 0) {
       // Append variant identifier (e.g. Premium, Bio, Local, Brand A)
       const variants = ['', 'Premium', 'Bio', 'Local', 'Eco', 'Basic', 'Gold', 'Silver', 'Bronze', 'Family Pack'];
       variantName = `${bp.name} ${variants[i]}`;
     }
     SIMULATED_PRODUCTS.push({
       ...bp,
       id: i === 0 ? bp.id : `${bp.id}-${i}`,
       name: variantName,
       // Remove real-mode link from variants in simulated mode
       mercadonaQuery: i === 0 ? bp.mercadonaQuery : undefined,
       basePrice: Number((bp.basePrice * (1 + (Math.random() * 0.4 - 0.2))).toFixed(2))
     });
  });
}

export const CATEGORIES: Category[] = [
  'Lácteos', 'Panadería', 'Aceites', 'Despensa', 'Carnes', 'Pescadería', 'Bebidas'
];

/**
 * Generate 365 days of synthetic historical data per product/supplier combo
 */
export function generateHistoricPrices(productId: string): PricePoint[] {
  const prod = SIMULATED_PRODUCTS.find(p => p.id === productId) || REAL_PRODUCTS.find(p => p.id === productId);
  if (!prod) return [];
  
  const points: PricePoint[] = [];
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const fifteenMinMs = 15 * 60 * 1000;
  
  const supplierMods: Record<string, number> = {};
  Object.keys(SUPPLIERS).forEach(sId => {
    supplierMods[sId] = 0.9 + (Math.random() * 0.2);
  });

  let currentPrices: Record<string, number> = {};
  Object.keys(SUPPLIERS).forEach(sId => {
    currentPrices[sId] = prod.basePrice * supplierMods[sId];
  });

  // 1. Generate roughly ~365 days of "daily" points (past 1 year to past 24h)
  // We'll skip the last 24h as we'll do high-res for that.
  for (let i = 365; i >= 1; i--) {
    const time = now - (i * dayMs);
    const point: PricePoint = { time };
    Object.keys(SUPPLIERS).forEach(sId => {
      const walk = 1 + (Math.random() * 0.04 - 0.02);
      currentPrices[sId] = Math.max(prod.basePrice * 0.8, Math.min(prod.basePrice * 1.5, currentPrices[sId] * walk));
      point[sId] = Number(currentPrices[sId].toFixed(2));
    });
    points.push(point);
  }

  // 2. Generate ~24 hours of "high-res" points (every 15 mins)
  const highResPoints = (24 * 60) / 15;
  for (let i = highResPoints; i >= 0; i--) {
    const time = now - (i * fifteenMinMs);
    const point: PricePoint = { time };
    Object.keys(SUPPLIERS).forEach(sId => {
      // Much smaller walk for short intervals
      const walk = 1 + (Math.random() * 0.004 - 0.002);
      currentPrices[sId] = Math.max(prod.basePrice * 0.8, Math.min(prod.basePrice * 1.5, currentPrices[sId] * walk));
      point[sId] = Number(currentPrices[sId].toFixed(2));
    });
    points.push(point);
  }
  
  return points;
}

// Combine and generate initial state for all possible products
export const INITIAL_MARKET_STATE = [...SIMULATED_PRODUCTS, ...REAL_PRODUCTS].reduce((acc, p) => {
  acc[p.id] = generateHistoricPrices(p.id);
  return acc;
}, {} as Record<string, PricePoint[]>);
