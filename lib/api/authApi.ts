import { apiMobile } from './client';
import type { LoginPayload, LoginResponse, RefreshPayload, AuthUser } from '../../types/auth';

/** POST /auth/login — returns an access + refresh token pair */
export const loginApi = async (payload: LoginPayload): Promise<LoginResponse> => {
  const response = await apiMobile.post('/auth/login', payload);
  return response.data;
};

/** POST /auth/refresh — exchange a refresh token for a new token pair */
export const refreshTokenApi = async (payload: RefreshPayload): Promise<LoginResponse> => {
  const response = await apiMobile.post('/auth/refresh', payload);
  return response.data;
};

/** GET /profile — the logged-in admin's brgy_users record */
export const getProfileApi = async (): Promise<AuthUser> => {
  const response = await apiMobile.get('/profile');
  return response.data?.data ?? response.data;
};
