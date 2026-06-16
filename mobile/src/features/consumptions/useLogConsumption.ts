import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  consumptionsApi,
  type RegisterConsumptionPayload,
} from '@/api/endpoints/consumptions';
import { leagueKeys } from '@/features/leagues/queryKeys';

/**
 * Registers a consumption. On success it invalidates the league's leaderboard
 * (and the leagues list) so any ranking view refreshes automatically.
 */
export function useLogConsumption(leagueId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RegisterConsumptionPayload) => consumptionsApi.register(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: leagueKeys.leaderboard(leagueId) });
      void queryClient.invalidateQueries({ queryKey: leagueKeys.mine });
    },
  });
}
