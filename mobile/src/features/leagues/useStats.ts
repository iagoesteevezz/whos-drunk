import { useQuery } from '@tanstack/react-query';
import { statsApi } from '@/api/endpoints/stats';
import { leagueKeys } from './queryKeys';

/** Fun aggregations for a league's active season. */
export function useStats(leagueId: string) {
  return useQuery({
    queryKey: leagueKeys.stats(leagueId),
    queryFn: () => statsApi.get(leagueId),
    enabled: !!leagueId,
  });
}
