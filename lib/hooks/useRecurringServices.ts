import { useQuery } from '@tanstack/react-query';
import {
  getMyRecurringServicesApi,
  getRecurringServiceRecordsApi,
} from '../api/recurringApi';

export const RECURRING_KEYS = {
  all: ['recurring'] as const,
  myServices: () => [...RECURRING_KEYS.all, 'myServices'] as const,
  records: (serviceId: string, filter: string) =>
    [...RECURRING_KEYS.all, 'records', serviceId, filter] as const,
};

export const useGetMyRecurringServices = () =>
  useQuery({
    queryKey: RECURRING_KEYS.myServices(),
    queryFn: getMyRecurringServicesApi,
    staleTime: 5 * 60 * 1000,
  });

export const useGetRecurringServiceRecords = (
  serviceId: string | null,
  filter: string,
) =>
  useQuery({
    queryKey: RECURRING_KEYS.records(serviceId ?? '', filter),
    queryFn: () => getRecurringServiceRecordsApi(serviceId!, filter),
    enabled: Boolean(serviceId),
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
  });
