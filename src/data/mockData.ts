export type Category = 'Lácteos' | 'Panadería' | 'Aceites' | 'Carnes' | 'Bebidas' | 'Despensa' | 'Pescadería' | 'Congelados' | 'Frutas y Verduras' | 'Hogar' | 'Cuidado Personal';

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
  displayName?: string;
  realThumbnail?: string;
  shareUrl?: string;
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
{ id: 'p43', name: 'Hamburguesas Vacuno', category: 'Carnes', unit: 'pack-2', icon: '🍔', basePrice: 3.20, mercadonaQuery: 'Hamburguesas de vacuno' },
{ id: 'p44', name: 'Salchichas Frankfurt', category: 'Carnes', unit: 'pack-6', icon: '🌭', basePrice: 1.15, mercadonaQuery: 'Salchichas Frankfurt' },
{ id: 'p45', name: 'Lomo Cerdo', category: 'Carnes', unit: '500g', icon: '🥩', basePrice: 4.80, mercadonaQuery: 'Lomo de cerdo fileteado' },
{ id: 'p46', name: 'Filete Ternera', category: 'Carnes', unit: '400g', icon: '🥩', basePrice: 7.50, mercadonaQuery: 'Filetes de ternera' },
{ id: 'p47', name: 'Bacon Ahumado', category: 'Carnes', unit: '200g', icon: '🥓', basePrice: 2.10, mercadonaQuery: 'Bacon en lonchas' },
{ id: 'p48', name: 'Judías Verdes Cong.', category: 'Congelados', unit: '1kg', icon: '🥦', basePrice: 1.80, mercadonaQuery: 'Judías verdes troceadas congeladas' },
{ id: 'p49', name: 'Guisantes Cong.', category: 'Congelados', unit: '1kg', icon: '🥬', basePrice: 1.95, mercadonaQuery: 'Guisantes muy finos congelados' },
{ id: 'p50', name: 'Salteado Verduras', category: 'Congelados', unit: '450g', icon: '🥗', basePrice: 1.60, mercadonaQuery: 'Salteado de verduras Hacendado' },
{ id: 'p51', name: 'Croquetas Jamón', category: 'Congelados', unit: '500g', icon: '🧆', basePrice: 2.50, mercadonaQuery: 'Croquetas de jamón Hacendado' },
{ id: 'p52', name: 'Varitas Merluza', category: 'Congelados', unit: '400g', icon: '🐟', basePrice: 3.20, mercadonaQuery: 'Varitas de merluza' },
{ id: 'p53', name: 'Zumo Naranja', category: 'Bebidas', unit: '1L', icon: '🍊', basePrice: 1.45, mercadonaQuery: 'Zumo de naranja exprimido con pulpa' },
{ id: 'p54', name: 'Té Helado Limón', category: 'Bebidas', unit: '1.5L', icon: '🍋', basePrice: 0.95, mercadonaQuery: 'Té helado limón' },
{ id: 'p55', name: 'Cerveza Alhambra', category: 'Bebidas', unit: '33cl', icon: '🍺', basePrice: 0.95, mercadonaQuery: 'Cerveza Alhambra Reserva 1925' },
{ id: 'p56', name: 'Vino Blanco Verdejo', category: 'Bebidas', unit: '75cl', icon: '🥂', basePrice: 2.80, mercadonaQuery: 'Vino blanco Verdejo' },
{ id: 'p57', name: 'Sidra El Gaitero', category: 'Bebidas', unit: '70cl', icon: '🍎', basePrice: 3.50, mercadonaQuery: 'Sidra El Gaitero' },
{ id: 'p58', name: 'Gel Baño Deliplus', category: 'Cuidado Personal', unit: '1L', icon: '🧼', basePrice: 1.20, mercadonaQuery: 'Gel de baño Deliplus piel normal' },
{ id: 'p59', name: 'Champú Reparación', category: 'Cuidado Personal', unit: '400ml', icon: '🧴', basePrice: 2.10, mercadonaQuery: 'Champú Deliplus reparación total' },
{ id: 'p60', name: 'Jabón Manos', category: 'Cuidado Personal', unit: '500ml', icon: '🧼', basePrice: 1.10, mercadonaQuery: 'Jabón de manos con dosificador' },
{ id: 'p61', name: 'Desodorante Hombre', category: 'Cuidado Personal', unit: '200ml', icon: '💨', basePrice: 1.85, mercadonaQuery: 'Desodorante spray hombre' },
{ id: 'p62', name: 'Pasta Dientes', category: 'Cuidado Personal', unit: '75ml', icon: '🪥', basePrice: 0.95, mercadonaQuery: 'Pasta de dientes dental' },
{ id: 'p63', name: 'Papel Higiénico', category: 'Hogar', unit: '12 uds', icon: '🧻', basePrice: 3.50, mercadonaQuery: 'Papel higiénico 2 capas' },
{ id: 'p64', name: 'Papel Cocina', category: 'Hogar', unit: '2 uds', icon: '🧻', basePrice: 1.95, mercadonaQuery: 'Papel de cocina absorbente' },
{ id: 'p65', name: 'Limpiacristales', category: 'Hogar', unit: '750ml', icon: '🪟', basePrice: 1.25, mercadonaQuery: 'Limpiacristales con pistola' },
{ id: 'p66', name: 'Lejía Detergente', category: 'Hogar', unit: '2L', icon: '🧴', basePrice: 0.95, mercadonaQuery: 'Lejía con detergente' },
{ id: 'p67', name: 'Suavizante Azul', category: 'Hogar', unit: '2L', icon: '🧺', basePrice: 1.85, mercadonaQuery: 'Suavizante ropa azul' },
{ id: 'p68', name: 'Cacahuetes Sal', category: 'Despensa', unit: '200g', icon: '🥜', basePrice: 1.10, mercadonaQuery: 'Cacahuetes tostados con sal' },
{ id: 'p69', name: 'Palomitas Maíz', category: 'Despensa', unit: '3x100g', icon: '🍿', basePrice: 0.95, mercadonaQuery: 'Palomitas de maíz microondas' },
{ id: 'p70', name: 'Chocolate 85%', category: 'Despensa', unit: '100g', icon: '🍫', basePrice: 1.25, mercadonaQuery: 'Chocolate negro 85% cacao Hacendado' },
{ id: 'p71', name: 'Berlinas Choco', category: 'Panadería', unit: '4 uds', icon: '🍩', basePrice: 1.60, mercadonaQuery: 'Berlinas chocolate' },
{ id: 'p72', name: 'Tortitas Maíz', category: 'Despensa', unit: '130g', icon: ' waffle', basePrice: 1.10, mercadonaQuery: 'Tortitas de maíz' },
{ id: 'p73', name: 'Comida Perro', category: 'Hogar', unit: '4kg', icon: '🐶', basePrice: 4.50, mercadonaQuery: 'Comida perro Compy' },
{ id: 'p74', name: 'Comida Gato', category: 'Hogar', unit: '2kg', icon: '🐱', basePrice: 3.20, mercadonaQuery: 'Comida gato Compy' },
{ id: 'p75', name: 'Garbanzos Cocidos', category: 'Despensa', unit: '400g', icon: '🥣', basePrice: 0.65, mercadonaQuery: 'Garbanzos cocidos Hacendado' },
{ id: 'p76', name: 'Lentejas Cocidas', category: 'Despensa', unit: '400g', icon: '🥣', basePrice: 0.65, mercadonaQuery: 'Lentejas cocidas Hacendado' },
{ id: 'p77', name: 'Judías Blancas', category: 'Despensa', unit: '400g', icon: '🥣', basePrice: 0.65, mercadonaQuery: 'Alubias blancas cocidas Hacendado' },
{ id: 'p78', name: 'Mayonesa', category: 'Despensa', unit: '450ml', icon: '🥫', basePrice: 1.25, mercadonaQuery: 'Mayonesa Hacendado' },
{ id: 'p79', name: 'Ketchup', category: 'Despensa', unit: '500g', icon: '🥫', basePrice: 1.35, mercadonaQuery: 'Ketchup Hacendado' },
{ id: 'p80', name: 'Mostaza', category: 'Despensa', unit: '300g', icon: '🥫', basePrice: 0.95, mercadonaQuery: 'Mostaza Hacendado' },
{ id: 'p81', name: 'Pimiento Rojo', category: 'Frutas y Verduras', unit: 'kg', icon: '🫑', basePrice: 2.80, mercadonaQuery: 'Pimiento rojo' },
{ id: 'p82', name: 'Calabacín', category: 'Frutas y Verduras', unit: 'kg', icon: '🥒', basePrice: 1.45, mercadonaQuery: 'Calabacín' },
{ id: 'p83', name: 'Pepino', category: 'Frutas y Verduras', unit: 'kg', icon: '🥒', basePrice: 1.20, mercadonaQuery: 'Pepino' },
{ id: 'p84', name: 'Aguacate', category: 'Frutas y Verduras', unit: 'ud', icon: '🥑', basePrice: 1.50, mercadonaQuery: 'Aguacate' },
{ id: 'p85', name: 'Champiñón Lamin.', category: 'Frutas y Verduras', unit: '250g', icon: '🍄', basePrice: 1.35, mercadonaQuery: 'Champiñón laminado' },
{ id: 'p86', name: 'Tomate Rama', category: 'Frutas y Verduras', unit: 'kg', icon: '🍅', basePrice: 2.10, mercadonaQuery: 'Tomate de rama' },
{ id: 'p87', name: 'Brócoli', category: 'Frutas y Verduras', unit: '500g', icon: '🥦', basePrice: 1.20, mercadonaQuery: 'Brócoli' },
{ id: 'p88', name: 'Ajos', category: 'Frutas y Verduras', unit: '250g', icon: '🧄', basePrice: 1.15, mercadonaQuery: 'Ajos' },
{ id: 'p89', name: 'Yogur Griego', category: 'Lácteos', unit: '6 uds', icon: '🍦', basePrice: 1.65, mercadonaQuery: 'Yogur griego natural Hacendado' },
{ id: 'p90', name: 'Queso Fresco', category: 'Lácteos', unit: '250g', icon: '🧀', basePrice: 1.95, mercadonaQuery: 'Queso fresco de Burgos' },
{ id: 'p91', name: 'Kéfir Natural', category: 'Lácteos', unit: '500g', icon: '🥛', basePrice: 1.40, mercadonaQuery: 'Kéfir natural Hacendado' },
];

// All products for Real Mode
export const REAL_PRODUCTS: Product[] = [...BASE_PRODUCTS];

// Variant distribution for Simulated Mode - DISABLED as per user request
export const SIMULATED_PRODUCTS: Product[] = [];

export const CATEGORIES: Category[] = [
  'Lácteos', 'Panadería', 'Aceites', 'Despensa', 'Carnes', 'Pescadería', 'Bebidas', 'Congelados', 'Frutas y Verduras', 'Hogar', 'Cuidado Personal'
];

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

  const highResPoints = (24 * 60) / 15;
  for (let i = highResPoints; i >= 0; i--) {
    const time = now - (i * fifteenMinMs);
    const point: PricePoint = { time };
    Object.keys(SUPPLIERS).forEach(sId => {
       const walk = 1 + (Math.random() * 0.004 - 0.002);
       currentPrices[sId] = Math.max(prod.basePrice * 0.8, Math.min(prod.basePrice * 1.5, currentPrices[sId] * walk));
       point[sId] = Number(currentPrices[sId].toFixed(2));
    });
    points.push(point);
  }
  
  return points;
}

export const INITIAL_MARKET_STATE = [...REAL_PRODUCTS.slice(0, 500)].reduce((acc, p) => {
  acc[p.id] = generateHistoricPrices(p.id);
  return acc;
}, {} as Record<string, PricePoint[]>);
