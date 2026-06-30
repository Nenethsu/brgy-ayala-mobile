export interface EventSector {
  id: number;
  name: string;
}

export type EventStatus = 'ONGOING' | 'INCOMING' | 'ENDED' | 'CANCELLED';

export interface BrgyEvent {
  eventId: string;
  id?: string;
  name: string;
  location: string;
  eventType: string;
  scheduleDate: string;
  totalSlot: number;
  noSlotLimit: 0 | 1;
  remSlot: number;
  status?: EventStatus;
  sectors?: EventSector[];
  dateCreated?: string;
  dateUpdated?: string;
}

export interface EventAttendee {
  attendeeId: string;
  eventId: string;
  citizenId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  isAttended: 0 | 1;
  dateUpdated?: string;
}

export interface CreateEventPayload {
  name: string;
  location: string;
  eventType: string;
  scheduleDate: string;
  totalSlot: number;
  noSlotLimit: 0 | 1;
}

export interface ScanPayload {
  eventId: string;
  citizenId: string[];
}

export interface ScanResult {
  success: boolean;
  message: string;
  attendee?: EventAttendee;
}
