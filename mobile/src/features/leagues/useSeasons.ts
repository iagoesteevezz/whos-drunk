import { useQuery } from '@tanstack/react-query';
import { seasonsApi } from '@/api/endpoints/seasons';
import { leagueKeys } from './queryKeys';

/** Season history for a league (most recent first). */
export function useSeasons(leagueId: string) {
  return useQuery({
    queryKey: leagueKeys.seasons(leagueId),
    queryFn: () => seasonsApi.list(leagueId),
    enabled: !!leagueId,
  });
}
