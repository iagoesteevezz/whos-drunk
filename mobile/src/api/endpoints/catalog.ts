import { api } from '@/api/client';

export type AbvSource = 'OPENFOODFACTS' | 'COCKTAILDB' | 'MANUAL' | 'DEFAULT';
export type DrinkTypeCode = 'BEER' | 'SPIRIT' | 'WINE' | 'CIDER' | 'COCKTAIL' | 'OTHER';

/**
 * Planned contract for the catalog search endpoint (backend `GET /drinks/search`).
 * Each result already carries a resolved `drinkId` we can post a consumption with.
 */
export interface DrinkSearchResult {
  drinkId: string;
  name: string;
  brandName: string | null;
  drinkType: DrinkTypeCode;
  abv: number;
  abvSource: AbvSource;
}

export const catalogApi = {
  async searchDrinks(query: string): Promise<DrinkSearchResult[]> {
    const { data } = await api.get<DrinkSearchResult[]>('/drinks/search', {
      params: { q: query },
    });
    return data;
  },
};
