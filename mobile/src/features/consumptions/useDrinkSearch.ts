import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { catalogApi, type DrinkSearchResult } from '@/api/endpoints/catalog';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { filterSample } from './sampleCatalog';

const MIN_QUERY_LENGTH = 2;

export interface DrinkSearchData {
  items: DrinkSearchResult[];
  /** True when results come from the local sample (catalog API unavailable). */
  isSample: boolean;
}

/**
 * Debounced drink search. Hits the real catalog endpoint when available and
 * falls back to a clearly-flagged local sample so the UI stays demonstrable
 * before `GET /drinks/search` is implemented.
 */
export function useDrinkSearch(rawQuery: string) {
  const query = useDebouncedValue(rawQuery.trim(), 300);
  const enabled = query.length >= MIN_QUERY_LENGTH;

  const result = useQuery<DrinkSearchData>({
    queryKey: ['drink-search', query],
    enabled,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      try {
        const items = await catalogApi.searchDrinks(query);
        return { items, isSample: false };
      } catch {
        // Backend catalog endpoint not ready (or offline) → sample fallback.
        return { items: filterSample(query), isSample: true };
      }
    },
  });

  return {
    query,
    enabled,
    isSearching: result.isFetching,
    items: result.data?.items ?? [],
    isSample: result.data?.isSample ?? false,
  };
}
