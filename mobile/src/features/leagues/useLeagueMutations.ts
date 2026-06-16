import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  leaguesApi,
  type CreateLeaguePayload,
  type League,
} from '@/api/endpoints/leagues';
import { leagueKeys } from './queryKeys';

/** Create a league. Invalidates the dashboard so it refreshes automatically. */
export function useCreateLeague() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateLeaguePayload) => leaguesApi.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: leagueKeys.mine });
    },
  });
}

export interface JoinResult {
  league: League;
  /** True when the user already belonged to this league (idempotent join). */
  alreadyMember: boolean;
}

/**
 * Join a league by invite code. Because the backend join is idempotent, we
 * detect the "already a member" case by comparing against the cached list so
 * the UI can show an informative message instead of a misleading "joined".
 */
export function useJoinLeague() {
  const queryClient = useQueryClient();
  return useMutation<JoinResult, unknown, string>({
    mutationFn: async (inviteCode: string) => {
      const cached = queryClient.getQueryData<League[]>(leagueKeys.mine) ?? [];
      const league = await leaguesApi.join(inviteCode);
      const alreadyMember = cached.some((l) => l.id === league.id);
      return { league, alreadyMember };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: leagueKeys.mine });
    },
  });
}
