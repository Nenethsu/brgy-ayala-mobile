import { useQuery } from '@tanstack/react-query';
import {
  getInhabitantsApi,
  getCitizenTypesApi,
  getCitizenTypeByIdApi,
  getClassificationsApi,
  getClassificationByIdApi,
} from '../api/contentApi';

export const CONTENT_KEYS = {
  inhabitants: ['content', 'inhabitants'] as const,
  citizenTypes: ['content', 'citizenTypes'] as const,
  citizenType: (id: number | string) => ['content', 'citizenTypes', id] as const,
  classifications: (typeId?: number | string) =>
    ['content', 'classifications', typeId] as const,
  classification: (id: number | string) => ['content', 'classifications', id] as const,
};

export const useGetInhabitants = () =>
  useQuery({
    queryKey: CONTENT_KEYS.inhabitants,
    queryFn: getInhabitantsApi,
    staleTime: 30 * 60 * 1000,
  });

export const useGetCitizenTypes = () =>
  useQuery({
    queryKey: CONTENT_KEYS.citizenTypes,
    queryFn: getCitizenTypesApi,
    staleTime: 30 * 60 * 1000,
  });

export const useGetCitizenTypeById = (id?: number | string) =>
  useQuery({
    queryKey: CONTENT_KEYS.citizenType(id!),
    queryFn: () => getCitizenTypeByIdApi(id!),
    enabled: Boolean(id),
    staleTime: 30 * 60 * 1000,
  });

export const useGetClassifications = (typeId?: number | string) =>
  useQuery({
    queryKey: CONTENT_KEYS.classifications(typeId),
    queryFn: () => getClassificationsApi(typeId),
    enabled: Boolean(typeId),
    staleTime: 15 * 60 * 1000,
  });

export const useGetClassificationById = (id?: number | string) =>
  useQuery({
    queryKey: CONTENT_KEYS.classification(id!),
    queryFn: () => getClassificationByIdApi(id!),
    enabled: Boolean(id),
    staleTime: 30 * 60 * 1000,
  });
