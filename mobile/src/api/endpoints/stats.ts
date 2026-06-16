import { api } from '@/api/client';

export interface StarDrink {
  drinkId: string;
  name: string;
  brandName: string | null;
  count: number;
}

export interface UserFavoriteDrink {
  rank: number;
  userId: string;
  displayName: string;
  drinkName: string;
  count: number;
}

export interface FireStreak {
  userId: string;
  displayName: string;
  days: number;
}

/** Mirrors the backend `LeagueStatsResponse`. */
export interface LeagueStats {
  seasonId: string | null;
  seasonName: string | null;
  totalConsumptions: number;
  starDrink: StarDrink | null;
  topFavorites: UserFavoriteDrink[];
  fireStreak: FireStreak | null;
}

export const statsApi = {
  async get(leagueId: string): Promise<LeagueStats> {
    const { data } = await api.get<LeagueStats>(`/leagues/${leagueId}/stats`);
    return data;
  },
};
