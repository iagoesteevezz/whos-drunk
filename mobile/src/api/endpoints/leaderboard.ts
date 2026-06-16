import { api } from '@/api/client';

/** Mirrors the backend `LeaderboardEntryResponse`. */
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  totalPoints: number;
  totalPureAlcoholG: number;
  totalConsumptions: number;
}

export const leaderboardApi = {
  async get(leagueId: string): Promise<LeaderboardEntry[]> {
    const { data } = await api.get<LeaderboardEntry[]>(`/leagues/${leagueId}/leaderboard`);
    return data;
  },
};
