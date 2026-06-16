import { api } from '@/api/client';

export type SeasonStatus = 'SCHEDULED' | 'ACTIVE' | 'CLOSED';

/** Mirrors the backend `SeasonResponse`. */
export interface Season {
  id: string;
  leagueId: string;
  name: string;
  status: SeasonStatus;
  startsAt: string;
  endsAt: string;
  winnerUserId: string | null;
  winnerDisplayName: string | null;
  winnerPoints: number | null;
}

export const seasonsApi = {
  async list(leagueId: string): Promise<Season[]> {
    const { data } = await api.get<Season[]>(`/leagues/${leagueId}/seasons`);
    return data;
  },
};
