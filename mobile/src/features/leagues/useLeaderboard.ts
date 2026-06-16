import { useQuery } from '@tanstack/react-query';
import { leaderboardApi } from '@/api/endpoints/leaderboard';
import { leagueKeys } from './queryKeys';

/** Season leaderboard for a league. Cached + invalidated after logging a drink. */
export function useLeaderboard(leagueId: string) {
  return useQuery({
    queryKey: leagueKeys.leaderboard(leagueId),
    queryFn: () => leaderboardApi.get(leagueId),
    enabled: !!leagueId,
  });
}
