import { api } from '@/api/client';

/** Body for `POST /consumptions` (the user is taken from the JWT, never the body). */
export interface RegisterConsumptionPayload {
  leagueId: string;
  drinkId: string;
  servingFormatId: number;
  quantity: number;
  volumeOverrideMl?: number;
  occurredAt?: string; // ISO instant
}

/** Mirrors the backend `ConsumptionResponse`. */
export interface ConsumptionResult {
  consumptionId: string;
  pureAlcoholGrams: number;
  points: number;
  scoringMode: string;
}

export const consumptionsApi = {
  async register(payload: RegisterConsumptionPayload): Promise<ConsumptionResult> {
    const { data } = await api.post<ConsumptionResult>('/consumptions', payload);
    return data;
  },
};
