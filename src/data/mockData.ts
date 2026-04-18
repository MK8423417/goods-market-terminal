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
}

export interface PricePoint {
  time: number;
  [supplierId: string]: number; // key is supplier id, value is price
}

export const SUPPLIERS: Record<string, Supplier> = {
  mercadona: { id: 'mercadona', name: 'Mercadona', color: '#00824E', logo: 'https://icon.horse/icon/mercadona.es' },
  dia: { id: 'dia', name: 'Dia', color: '#D6002A', logo: 'https://icon.horse/icon/dia.es' },
  lidl: { id: 'lidl', name: 'Lidl', color: '#0050AA', logo: 'https://icon.horse/icon/lidl.com' },
  carrefour: { id: 'carrefour', name: 'Carrefour', color: '#004C99', logo: 'https://icon.horse/icon/carrefour.es' },
  alcampo: { id: 'alcampo', name: 'Alcampo', color: '#E30613', logo: 'https://icon.horse/icon/alcampo.es' },
  aldi: { id: 'aldi', name: 'Aldi', color: '#0000FF', logo: 'https://icon.horse/icon/aldi.es' },
  eroski: { id: 'eroski', name: 'Eroski', color: '#0054A6', logo: 'https://icon.horse/icon/eroski.es' },
  consum: { id: 'consum', name: 'Consum', color: '#F18E00', logo: 'https://icon.horse/icon/consum.es' },
  ahorramas: { id: 'ahorramas', name: 'Ahorramas', color: '#FFD100', logo: 'https://icon.horse/icon/ahorramas.com' },
  coviran: { id: 'coviran', name: 'Coviran', color: '#009739', logo: 'https://icon.horse/icon/coviran.es' },
  froiz: { id: 'froiz', name: 'Froiz', color: '#ED1C24', logo: 'https://icon.horse/icon/froiz.com' },
  bonpreu: { id: 'bonpreu', name: 'Bonpreu', color: '#E85B22', logo: 'https://icon.horse/icon/bonpreu.cat' },
  gadis: { id: 'gadis', name: 'Gadis', color: '#005BBB', logo: 'https://icon.horse/icon/gadis.es' },
  hipercor: { id: 'hipercor', name: 'Hipercor', color: '#008C45', logo: 'https://icon.horse/icon/elcorteingles.es' }
};

export const BASE_PRODUCTS: Product[] = [
  { id: '1', name: 'Huevos L', category: 'Lácteos', unit: 'docena', icon: '🥚', basePrice: 2.15 },
  { id: '2', name: 'Leche Entera', category: 'Lácteos', unit: '1L', icon: '🥛', basePrice: 0.89 },
  { id: '3', name: 'Pan de Molde', category: 'Panadería', unit: '460g', icon: '🍞', basePrice: 1.25 },
  { id: '4', name: 'Aceite de Oliva Virgen Extra', category: 'Aceites', unit: '1L', icon: '🫒', basePrice: 8.95 },
  { id: '5', name: 'Arroz Redondo', category: 'Despensa', unit: '1kg', icon: '🍚', basePrice: 1.30 },
  { id: '6', name: 'Pasta (Macarrones)', category: 'Despensa', unit: '500g', icon: '🍝', basePrice: 0.80 },
  { id: '7', name: 'Pechuga de Pollo', category: 'Carnes', unit: '1kg', icon: '🍗', basePrice: 6.50 },
  { id: '8', name: 'Atún Claro (3 latas)', category: 'Pescadería', unit: 'pack', icon: '🐟', basePrice: 2.95 },
  { id: '9', name: 'Azúcar Blanco', category: 'Despensa', unit: '1kg', icon: '🧁', basePrice: 1.45 },
  { id: '10', name: 'Café Molido', category: 'Despensa', unit: '250g', icon: '☕', basePrice: 2.70 },
  { id: '11', name: 'Cerveza Lager', category: 'Bebidas', unit: '33cl', icon: '🍺', basePrice: 0.40 },
  { id: '12', name: 'Agua Mineral', category: 'Bebidas', unit: '1.5L', icon: '💧', basePrice: 0.25 },
  { id: '13', name: 'Queso Gouda', category: 'Lácteos', unit: '300g', icon: '🧀', basePrice: 2.80 },
  { id: '14', name: 'Tomate Frito', category: 'Despensa', unit: '390g', icon: '🍅', basePrice: 0.65 },
  { id: '15', name: 'Carne Picada Mix', category: 'Carnes', unit: '400g', icon: '🥩', basePrice: 3.50 },
  { id: '16', name: 'Mantequilla', category: 'Lácteos', unit: '250g', icon: '🧈', basePrice: 2.10 },
  { id: '17', name: 'Cebollas', category: 'Despensa', unit: '1kg', icon: '🧅', basePrice: 1.65 },
  { id: '18', name: 'Patatas', category: 'Despensa', unit: '3kg', icon: '🥔', basePrice: 3.60 },
  { id: '19', name: 'Harina de Trigo', category: 'Despensa', unit: '1kg', icon: '🌾', basePrice: 0.75 },
  { id: '20', name: 'Sal Fina', category: 'Despensa', unit: '1kg', icon: '🧂', basePrice: 0.35 },
];

// Procedurally generate 200 products
export const PRODUCTS: Product[] = [];
for (let i = 0; i < 10; i++) {
  BASE_PRODUCTS.forEach((bp) => {
     let variantName = bp.name;
     if (i > 0) {
       // Append variant identifier (e.g. Premium, Bio, Local, Brand A)
       const variants = ['', 'Premium', 'Bio', 'Local', 'Eco', 'Basic', 'Gold', 'Silver', 'Bronze', 'Family Pack'];
       variantName = `${bp.name} ${variants[i]}`;
     }
     PRODUCTS.push({
       ...bp,
       id: i === 0 ? bp.id : `${bp.id}-${i}`,
       name: variantName,
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
  const prod = PRODUCTS.find(p => p.id === productId);
  if (!prod) return [];
  
  const points: PricePoint[] = [];
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  
  // Random deviations for each supplier
  const supplierMods: Record<string, number> = {};
  Object.keys(SUPPLIERS).forEach(sId => {
    supplierMods[sId] = 0.9 + (Math.random() * 0.2); // 0.9 to 1.1
  });

  // Seed fixed starting points
  let currentPrices: Record<string, number> = {};
  Object.keys(SUPPLIERS).forEach(sId => {
    currentPrices[sId] = prod.basePrice * supplierMods[sId];
  });

  // Generate 365 days of data
  for (let i = 365; i >= 0; i--) {
    const time = now - (i * dayMs);
    const point: PricePoint = { time };
    
    Object.keys(SUPPLIERS).forEach(sId => {
      // Small daily random walk (variance 0.01)
      const walk = 1 + (Math.random() * 0.04 - 0.02);
      let newPrice = currentPrices[sId] * walk;
      // Cap at reasonable min/max
      newPrice = Math.max(prod.basePrice * 0.8, Math.min(prod.basePrice * 1.5, newPrice));
      currentPrices[sId] = newPrice;
      point[sId] = Number(newPrice.toFixed(2));
    });

    points.push(point);
  }
  
  return points;
}

export const INITIAL_MARKET_STATE = PRODUCTS.reduce((acc, p) => {
  acc[p.id] = generateHistoricPrices(p.id);
  return acc;
}, {} as Record<string, PricePoint[]>);
