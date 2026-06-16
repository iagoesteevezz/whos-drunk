import type { DrinkSearchResult } from '@/api/endpoints/catalog';

/**
 * Placeholder catalog used ONLY as a visual fallback until the backend
 * `GET /drinks/search` endpoint exists. The screen clearly flags these as
 * sample data. The drink IDs are not real, so posting against a live backend
 * with them will fail until the catalog endpoint seeds real drinks.
 */
export const SAMPLE_DRINKS: DrinkSearchResult[] = [
  { drinkId: 'sample-mahou', name: 'Mahou Cinco Estrellas', brandName: 'Mahou', drinkType: 'BEER', abv: 5.5, abvSource: 'OPENFOODFACTS' },
  { drinkId: 'sample-estrella-galicia', name: 'Estrella Galicia Especial', brandName: 'Estrella Galicia', drinkType: 'BEER', abv: 5.5, abvSource: 'OPENFOODFACTS' },
  { drinkId: 'sample-estrella-damm', name: 'Estrella Damm', brandName: 'Damm', drinkType: 'BEER', abv: 4.6, abvSource: 'OPENFOODFACTS' },
  { drinkId: 'sample-rioja', name: 'Rioja Crianza', brandName: 'Generic', drinkType: 'WINE', abv: 13.5, abvSource: 'DEFAULT' },
  { drinkId: 'sample-jb', name: "J&B Rare Whisky", brandName: 'J&B', drinkType: 'SPIRIT', abv: 40, abvSource: 'OPENFOODFACTS' },
  { drinkId: 'sample-larios', name: 'Larios Gin', brandName: 'Larios', drinkType: 'SPIRIT', abv: 37.5, abvSource: 'OPENFOODFACTS' },
];

/** Generic fallbacks by type when nothing matches (DEFAULT ABV, low confidence). */
export const GENERIC_DRINKS: DrinkSearchResult[] = [
  { drinkId: 'generic-beer', name: 'Generic beer', brandName: null, drinkType: 'BEER', abv: 5, abvSource: 'DEFAULT' },
  { drinkId: 'generic-wine', name: 'Generic wine', brandName: null, drinkType: 'WINE', abv: 12.5, abvSource: 'DEFAULT' },
  { drinkId: 'generic-spirit', name: 'Generic spirit', brandName: null, drinkType: 'SPIRIT', abv: 40, abvSource: 'DEFAULT' },
];

export function filterSample(query: string): DrinkSearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const matches = SAMPLE_DRINKS.filter(
    (d) => d.name.toLowerCase().includes(q) || d.brandName?.toLowerCase().includes(q),
  );
  // Always offer the generic fallbacks at the end.
  return [...matches, ...GENERIC_DRINKS];
}
