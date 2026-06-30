import { apiV2 } from './client';

export interface RecurringService {
  serviceId: string;
  serviceName: string;
  stationId: string;
  stationName: string;
  limit: number;
  mode: string;
  options: number;
}

export interface ServiceRecord {
  accountId: string;
  citizenFirstName: string;
  citizenMiddleName: string | null;
  citizenLastName: string;
  citizenSuffix: string | null;
  citizenContactNumber: string;
  unitNo: string;
  houseNo: string;
  street: string;
  phase: string;
  stationName: string;
  quantity: number;
  dateClaimed: string;
  scannerFirstName: string;
  scannerMiddleName: string | null;
  scannerLastName: string;
  scannerSuffix: string | null;
}

export const getMyRecurringServicesApi = async (): Promise<RecurringService[]> => {
  const response = await apiV2.get('/recurring/getMyRecurringServices');
  return response.data?.data ?? response.data ?? [];
};

export const getRecurringServiceRecordsApi = async (
  serviceId: string,
  filter: string,
): Promise<ServiceRecord[]> => {
  const response = await apiV2.get(
    `/recurring/getRecurringServiceRecords/${serviceId}/?filter=${filter}`,
  );
  return response.data?.data ?? response.data ?? [];
};
