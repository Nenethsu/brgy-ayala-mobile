import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCitizensApi,
  getCitizenByIdApi,
  addCitizenApi,
  updateCitizenApi,
  uploadCitizenSignatureApi,
  uploadCitizenFileApi,
  validateUsernameApi,
} from '../api/citizenApi';
import type { CitizenListParams, UpdateCitizenPayload } from '../../types/citizen';

export const CITIZEN_KEYS = {
  all: ['citizens'] as const,
  lists: () => [...CITIZEN_KEYS.all, 'list'] as const,
  list: (params: CitizenListParams) => [...CITIZEN_KEYS.lists(), params] as const,
  details: () => [...CITIZEN_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...CITIZEN_KEYS.details(), id] as const,
};

export const useGetCitizens = (params: CitizenListParams) =>
  useQuery({
    queryKey: CITIZEN_KEYS.list(params),
    queryFn: () => getCitizensApi(params),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

export const useGetCitizenById = (id: string | undefined) =>
  useQuery({
    queryKey: CITIZEN_KEYS.detail(id ?? ''),
    queryFn: () => getCitizenByIdApi(id!),
    enabled: Boolean(id),
    staleTime: 10 * 60 * 1000,
  });

export const useAddCitizen = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addCitizenApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CITIZEN_KEYS.lists() });
    },
  });
};

export const useUpdateCitizen = (accountId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateCitizenPayload) => updateCitizenApi(accountId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CITIZEN_KEYS.detail(accountId) });
      queryClient.invalidateQueries({ queryKey: CITIZEN_KEYS.lists() });
    },
  });
};

export const useUploadCitizenSignature = (accountId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (b64: string) => uploadCitizenSignatureApi(accountId, b64),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CITIZEN_KEYS.detail(accountId) });
    },
  });
};

export const useUploadCitizenFile = (accountId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ fieldName, uri }: { fieldName: 'identification' | 'document'; uri: string }) =>
      uploadCitizenFileApi(accountId, fieldName, uri),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CITIZEN_KEYS.detail(accountId) });
    },
  });
};

export const useValidateUsername = () =>
  useMutation({
    mutationFn: validateUsernameApi,
  });
