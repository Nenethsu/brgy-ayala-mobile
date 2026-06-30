import { format, parseISO, isAfter, isBefore } from 'date-fns';
import type { BrgyEvent } from '../../types/event';

export const getEventId = (event: BrgyEvent): string =>
  event.eventId ?? event.id ?? '';

export const parseSchedule = (scheduleDate: string) => {
  const parts = scheduleDate.split(';');
  const start = parts[0] ? parseISO(parts[0]) : new Date();
  const end = parts[1] ? parseISO(parts[1]) : start;
  return { start, end };
};

export const isOngoing = (event: BrgyEvent): boolean => {
  const { start, end } = parseSchedule(event.scheduleDate);
  const now = new Date();
  return !isBefore(now, start) && !isAfter(now, end);
};

export const getEventStatus = (event: BrgyEvent): { label: string; color: string } => {
  if (!event.scheduleDate) return { label: 'Unknown', color: '#94A3B8' };
  const { start, end } = parseSchedule(event.scheduleDate);
  const now = new Date();
  if (isAfter(now, end)) return { label: 'Ended', color: '#94A3B8' };
  if (isBefore(now, start)) return { label: 'Incoming', color: '#3B82F6' };
  return { label: 'Ongoing', color: '#14B8A6' };
};

export const formatEventSchedule = (event: BrgyEvent): string => {
  if (!event.scheduleDate) return '—';
  const { start, end } = parseSchedule(event.scheduleDate);
  const startStr = format(start, 'MMM d, yyyy');
  const endStr = format(end, 'MMM d, yyyy');
  return startStr === endStr ? `${startStr} · ${format(start, 'h:mm a')}` : `${startStr} – ${endStr}`;
};

export const getEventCategory = (event: BrgyEvent): string => {
  if (!event.sectors || event.sectors.length === 0) return 'Open to All Citizens';
  return event.sectors.map((s) => s.name).join(' · ');
};

export const getFullName = (person: { firstName: string; middleName?: string; lastName: string }) =>
  [person.firstName, person.middleName, person.lastName].filter(Boolean).join(' ');
