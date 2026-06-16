/** Centralized TanStack Query keys for the leagues feature. */
export const leagueKeys = {
  mine: ['my-leagues'] as const,
  leaderboard: (leagueId: string) => ['leaderboard', leagueId] as const,
  seasons: (leagueId: string) => ['seasons', leagueId] as const,
};
