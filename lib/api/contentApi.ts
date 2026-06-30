import { apiV3 } from './client';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReferenceItem {
  id: number | string;
  name: string;
  typeId?: string | number;
}

/** Shape of each item from GET /content/citizenTypes */
export interface CitizenType {
  id: number;
  type: string;
  brgyId: number;
  /** 0 = active */
  status: number;
  imageFront: string | null;
  imageBack: string | null;
  imageFrontApprove: number;
  imageBackApprove: number;
  dateCreated: string;
  dateUpdated: string;
}

/** Shape of each item from GET /content/citizenTypeClassifications */
export interface CitizenTypeClassification {
  id: number;
  name: string;
  typeId: number;
  brgyId: number;
  /** 0 = active */
  isDeleted: number;
  dateCreated: string;
  dateUpdated: string;
}

// ─── Inhabitants ──────────────────────────────────────────────────────────────

export const getInhabitantsApi = async (): Promise<ReferenceItem[]> => {
  const res = await apiV3.get('/content/inhabitants');
  console.log(res)
  return res.data.data;
};

export const getInhabitantsByIdApi = async (citizenTypeId?: number | string): Promise<ReferenceItem[]> => {
  const res = await apiV3.get('/content/inhabitants/', {
    params: citizenTypeId ? { citizenTypeId } : undefined,
  });
  return res.data;
};

// ─── Citizen types ────────────────────────────────────────────────────────────

/** GET /content/citizenTypes — returns all citizen types for the barangay */
export const getCitizenTypesApi = async (): Promise<CitizenType[]> => {
  const res = await apiV3.get('/content/citizenTypes');
  return res.data?.data ?? res.data;
};

/** GET /content/citizenTypes/:id */
export const getCitizenTypeByIdApi = async (id: number | string): Promise<CitizenType> => {
  const res = await apiV3.get(`/content/citizenTypes/${id}`);
  return res.data?.data ?? res.data;
};

// ─── Citizen type classifications ─────────────────────────────────────────────

/** GET /content/citizenTypeClassifications?typeId=:typeId — typeId is required by the API */
export const getClassificationsApi = async (typeId?: number | string): Promise<CitizenTypeClassification[]> => {
  const res = await apiV3.get('/content/citizenTypeClassifications', {
    params: typeId ? { typeId } : undefined,
  });
  return res.data?.data ?? res.data;
};

/** GET /content/citizenTypeClassifications/:id */
export const getClassificationByIdApi = async (id: number | string): Promise<CitizenTypeClassification> => {
  const res = await apiV3.get(`/content/citizenTypeClassifications/${id}`);
  return res.data?.data ?? res.data;
};
