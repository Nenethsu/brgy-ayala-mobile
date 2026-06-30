import { apiV3 } from './client';
import type { BrgyEvent, EventAttendee, CreateEventPayload, ScanPayload, ScanResult } from '../../types/event';

export const getEventsApi = async (): Promise<BrgyEvent[]> => {
  const response = await apiV3.get('/events');
  return response.data;
};

export const createEventApi = async (body: CreateEventPayload): Promise<BrgyEvent> => {
  const response = await apiV3.post('/events', body);
  return response.data;
};

export const updateEventApi = async ({
  id,
  body,
}: {
  id: string;
  body: Partial<CreateEventPayload>;
}): Promise<BrgyEvent> => {
  const response = await apiV3.patch(`/events/${id}`, body);
  return response.data;
};

export const changeEventStatusApi = async ({
  id,
  status,
}: {
  id: string;
  status: string;
}): Promise<void> => {
  await apiV3.patch(`/events/${id}/status`, { status });
};

export const getEventAttendeesApi = async (eventId: string): Promise<EventAttendee[]> => {
  const response = await apiV3.get(`/events/${eventId}/attendees`);
  return response.data;
};

export const scanAttendeeApi = async (body: ScanPayload): Promise<ScanResult> => {
  const response = await apiV3.post('/events/scan', body);
  return response.data;
};

export const addAttendeeApi = async (body: ScanPayload): Promise<void> => {
  await apiV3.post('/events/attendees', body);
};
