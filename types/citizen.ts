export interface CitizenFile {
  id: number;
  accountId: string;
  image: string;
  imageId: string;
  type: 'PROFILE_ID' | 'PROFILE_DOCUMENT' | string;
  module: string;
  isDeleted: '0' | '1';
  dateCreated: string;
  dateUpdated: string;
}

/** Parsed shape of the `otherInfo` JSON string returned by the citizen API */
export interface OtherInfo {
  address?: string;
  birthplace?: string;
  bloodType?: string;
  citizenship?: string;
  civilStatus?: string;
  contactPerson?: string;
  contactPersonNumber?: string;
  dateIssued?: string;
  occupation?: string;
  pagibigNumber?: string;
  philhealthNumber?: string;
  relationship?: number;
  tinNumber?: string;
  sssNumber?: string;
  precinct?: string;
}

export interface Citizen {
  accountId: string;
  idNumber: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  birthdate: string;
  sex?: 0 | 1;
  type?: number;
  classification?: number;
  inhabitantType?: number;
  district?: string;
  brgyId?: string;
  primaryEmail?: string;
  primaryMobile?: string;
  primaryMobilenumber?: string;
  username?: string;
  /** Serialized JSON — parse with JSON.parse(citizen.otherInfo) into OtherInfo */
  otherInfo?: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  dateCreated: string;
  dateUpdated: string;
  // Fields that may appear on older API responses:
  age?: number;
  typeName?: string;
  classificationName?: string;
  inhabitantName?: string;
  files?: CitizenFile[];
  gender?: string;
  address?: CitizenAddress;
}

export interface CitizenAddress {
  street?: string;
  barangay?: string;
  municipality?: string;
  province?: string;
  zipCode?: string;
  fullAddress?: string;
}

export interface CitizenListParams {
  page?: number;
  limit?: number;
  firstName?: string;
  lastName?: string;
  idNumber?: string;
  type?: number;
  status?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface CitizenListResponse {
  data: Citizen[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Payload for POST /citizens — admin context (brgyId, regionId…) injected server-side from token */
export interface CreateCitizenPayload {
  firstName: string;
  middleName?: string | null;
  lastName: string;
  suffix?: string;
  birthdate: string;
  sex: 0 | 1;
  type: number;
  district?: number;
  inhabitantTypeId?: number;
  classificationId?: number;
  email?: string;
  mobileNumber?: string;
  username: string;
}

/** Payload for PATCH /citizens/:accountId */
export interface UpdateCitizenPayload {
  firstName?: string;
  middleName?: string | null;
  lastName?: string;
  suffix?: string;
  birthdate?: string;
  sex?: 0 | 1;
  mobileNumber?: string;
  email?: string;
}
