// @ts-ignore - flexsearch has sparse types in some environments
import { Index } from 'flexsearch';

let searchIndex: Index | null = null;
let productsMap = new Map();

self.onmessage = (e) => {
  const { type, payload } = e.data;

  if (type === 'POPULATE') {
    const products = payload;
    searchIndex = new Index({
      preset: 'score',
      tokenize: 'forward',
      cache: true
    });

    products.forEach((p: any) => {
      const searchStr = `${p.displayName || p.name} ${p.name} ${p.category} ${p.brand || ''}`;
      searchIndex?.add(p.id, searchStr);
      productsMap.set(p.id, p);
    });

    self.postMessage({ type: 'POPULATE_READY' });
  }

  if (type === 'SEARCH') {
    const { query, limit = 50 } = payload;
    if (!searchIndex || !query) {
      self.postMessage({ type: 'SEARCH_RESULTS', payload: { results: [], query } });
      return;
    }

    const results = searchIndex.search(query, limit);
    self.postMessage({ type: 'SEARCH_RESULTS', payload: { results, query } });
  }
};
