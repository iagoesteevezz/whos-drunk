import { api } from '@/api/client';

export interface RegisterDeviceTokenPayload {
  token: string;
  platform: 'ios' | 'android' | 'unknown';
}

export const usersApi = {
  async registerDeviceToken(payload: RegisterDeviceTokenPayload): Promise<void> {
    await api.post('/users/me/device-tokens', payload);
  },
};
