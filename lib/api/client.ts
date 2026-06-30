import axios from 'axios';

const BASE = process.env.EXPO_PUBLIC_BASE_URL;

// Primary client for all /v3/mobile endpoints
export const apiMobile = axios.create({
  baseURL: `${BASE}/api/v3/mobile`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Legacy clients retained for any non-migrated routes (events, content)
export const apiV2 = axios.create({
  baseURL: `${BASE}/api/cms/brgy`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

export const apiV3 = axios.create({
  baseURL: `${BASE}/api/v3/cms/brgy`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Dynamically resolved at call time to avoid circular imports.
// Zustand's getState() is synchronous and safe outside components.
const getToken = (): string | null => {
  try {
    const { useAuthStore } = require('../../store/authStore');
    return useAuthStore.getState().accessToken;
  } catch {
    return null;
  }
};

const attachToken = (config: any) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
};

const handleAuthError = (error: any) => {
  if (error.response?.status === 401) {
    try {
      const { useAuthStore } = require('../../store/authStore');
      useAuthStore.getState().clearAuth();
    } catch {
      // store not yet initialized
    }
  }
  return Promise.reject(error);
};

[apiMobile, apiV2, apiV3].forEach((instance) => {
  instance.interceptors.request.use(attachToken, Promise.reject);
  instance.interceptors.response.use((r) => r, handleAuthError);
});
