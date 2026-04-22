import { api } from './api';
import { tokenStorage } from './tokenStorage';
import type { LoginCredentials, SignUpCredentials } from '@/types';

export const authService = {
  async login(credentials: LoginCredentials) {
    const response = await api.post('/lawyer/login', credentials);

    const { accessToken, refreshToken, lawyer } = response.data;

    await tokenStorage.setTokens(accessToken, refreshToken);

    return lawyer;

  },

  async signUp(credentials: SignUpCredentials) {
    const response = await api.post('/lawyer/register', credentials);

    const { accessToken, refreshToken, lawyer } = response.data;

    if (accessToken && refreshToken) {
      await tokenStorage.setTokens(accessToken, refreshToken);
    }

    return lawyer;
  },

  async logout() {
    try {
      await api.post('/lawyer/logout');
    } catch (err) {
      console.log("LOGOUT ERR", err);
    } finally {
      await tokenStorage.clear();
    }
  },

  async getProfile() {
    const response = await api.get('/lawyer/me');
    return response.data.lawyer;
  },

  async completeProfile(data: any) {
    const response = await api.post('/lawyer/complete-profile', data);
    return response.data.lawyer;
  },
};
