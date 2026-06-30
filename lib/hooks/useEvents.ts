import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getEventsApi,
  getEventAttendeesApi,
  createEventApi,
  updateEventApi,
  changeEventStatusApi,
  scanAttendeeApi,
  addAttendeeApi,
} from '../api/eventsApi';
import type { CreateEventPayload, ScanPayload } from '../../types/event';

export const EVENT_KEYS = {
  all: ['events'] as const,
  lists: () => [...EVENT_KEYS.all, 'list'] as const,
  attendees: (eventId: string) => [...EVENT_KEYS.all, 'attendees', eventId] as const,
};

export const useGetEvents = () =>
  useQuery({
    queryKey: EVENT_KEYS.lists(),
    queryFn: getEventsApi,
    staleTime: 2 * 60 * 1000,
  });

export const useGetEventAttendees = (eventId: string | null) =>
  useQuery({
    queryKey: EVENT_KEYS.attendees(eventId ?? ''),
    queryFn: () => getEventAttendeesApi(eventId!),
    enabled: Boolean(eventId),
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateEventPayload) => createEventApi(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: EVENT_KEYS.lists() }),
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateEventApi,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: EVENT_KEYS.lists() }),
  });
};

export const useChangeEventStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: changeEventStatusApi,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: EVENT_KEYS.lists() }),
  });
};

export const useScanAttendee = (eventId: string | null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ScanPayload) => scanAttendeeApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENT_KEYS.lists() });
      if (eventId) {
        queryClient.invalidateQueries({ queryKey: EVENT_KEYS.attendees(eventId) });
      }
    },
  });
};

export const useAddAttendee = (eventId: string | null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ScanPayload) => addAttendeeApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENT_KEYS.lists() });
      if (eventId) {
        queryClient.invalidateQueries({ queryKey: EVENT_KEYS.attendees(eventId) });
      }
    },
  });
};
