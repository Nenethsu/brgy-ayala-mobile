import * as FileSystem from 'expo-file-system/legacy';
import { apiMobile } from './client';
import type {
  Citizen,
  CitizenListParams,
  CitizenListResponse,
  UpdateCitizenPayload,
} from '../../types/citizen';

export const getCitizensApi = async (params: CitizenListParams): Promise<CitizenListResponse> => {
  const response = await apiMobile.get('/citizens', { params });
  const raw = response.data;
  // Server wraps list responses: { data: CitizenListResponse }
  // Fall back to raw if it already has pagination fields at the top level
  return raw?.totalPages != null ? raw : (raw?.data ?? raw);
};

export const getCitizenByIdApi = async (id: string): Promise<Citizen> => {
  const response = await apiMobile.get(`/citizens/${id}`);
  return response.data?.data ?? response.data;
};

export const addCitizenApi = async (body: FormData): Promise<Citizen> => {
  const response = await apiMobile.post('/citizens', body, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data?.data ?? response.data;
};

export const updateCitizenApi = async (
  accountId: string,
  body: UpdateCitizenPayload,
): Promise<Citizen> => {
  const response = await apiMobile.patch(`/citizens/${accountId}`, body);
  return response.data?.data ?? response.data;
};

export const uploadCitizenSignatureApi = async (
  accountId: string,
  signatureB64: string,
): Promise<{ message: string }> => {
  // Write base64 to a temp file — Multer requires a real file:// URI, not a text field.
  const path = `${FileSystem.cacheDirectory}sig_${accountId}_${Date.now()}.png`;
  await FileSystem.writeAsStringAsync(path, signatureB64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const fd = new FormData();
  fd.append('signature', { uri: path, name: 'signature.png', type: 'image/png' } as any);

  // Use fetch, not axios — axios calls .on() on FormData treating it as a Node stream,
  // which doesn't exist in React Native and throws "source.on is not a function".
  const { useAuthStore } = require('../../store/authStore');
  const token: string | null = useAuthStore.getState().accessToken;
  const BASE = process.env.EXPO_PUBLIC_BASE_URL;

  const res = await fetch(
    `${BASE}/api/v3/mobile/citizens/${accountId}/uploads`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    },
  );

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw { response: { data: json, status: res.status } };
  return json;
};

export const uploadCitizenFileApi = async (
  accountId: string,
  fieldName: 'identification' | 'document',
  fileUri: string,
): Promise<{ message: string }> => {
  const fd = new FormData();
  fd.append(fieldName, { uri: fileUri, name: `${fieldName}.jpg`, type: 'image/jpeg' } as any);

  const { useAuthStore } = require('../../store/authStore');
  const token: string | null = useAuthStore.getState().accessToken;
  const BASE = process.env.EXPO_PUBLIC_BASE_URL;

  const res = await fetch(
    `${BASE}/api/v3/mobile/citizens/${accountId}/uploads`,
    { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd },
  );
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw { response: { data: json, status: res.status } };
  return json;
};

export const validateUsernameApi = async (username: string): Promise<boolean> => {
  const response = await apiMobile.get('/citizens/validate-username', { params: { username } });
  return response.data?.available ?? true;
};
