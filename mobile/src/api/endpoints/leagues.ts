import { api } from '@/api/client';

export type MembershipRole = 'OWNER' | 'ADMIN' | 'MEMBER';

/** Mirrors the backend `LeagueResponse`. */
export interface League {
  id: string;
  name: string;
  description: string | null;
  inviteCode: string;
  scoringMode: string;
  scoreMultiplier: number;
  gramsPerUnit: number;
  seasonLengthDays: number;
  memberCount: number;
  myRole: MembershipRole;
}

/** Mirrors the backend `CreateLeagueRequest` (optional fields may be omitted). */
export interface CreateLeaguePayload {
  name: string;
  description?: string;
  scoreMultiplier?: number;
  gramsPerUnit?: number;
  seasonLengthDays?: number;
}

export const leaguesApi = {
  async myLeagues(): Promise<League[]> {
    const { data } = await api.get<League[]>('/leagues');
    return data;
  },

  async create(payload: CreateLeaguePayload): Promise<League> {
    const { data } = await api.post<League>('/leagues', payload);
    return data;
  },

  async join(inviteCode: string): Promise<League> {
    const { data } = await api.post<League>('/leagues/join', { inviteCode });
    return data;
  },
};
