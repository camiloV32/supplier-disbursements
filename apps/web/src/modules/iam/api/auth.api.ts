import { apiClient } from '@/config/api-client';
import type { AuthUser } from '../types/auth-user.type';

export const login = async (email: string, password: string): Promise<void> => {
  await apiClient.post('/auth/login', { email, password });
};

export const logout = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
};

export const getCurrentUser = async (): Promise<AuthUser> => {
  const { data } = await apiClient.get<AuthUser>('/auth/me');
  return data;
};
