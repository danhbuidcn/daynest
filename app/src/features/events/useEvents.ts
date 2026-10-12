import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/AuthProvider';
import * as googleSync from '@/features/google/sync';
import { resyncReminders } from '@/features/reminders/reminderSync';
import { isoDate } from '@/lib/calendar/monthGrid';
import { DEFAULT_TIME_ZONE } from '@/lib/calendar/timeZone';
import type { DateRange } from '@/lib/recurrence';
import * as api from './api';
import type { EventInput } from './event';
import { occurrencesForEvents, type ExceptionKind } from './occurrences';

export const EVENTS_KEY = 'events';

export function eventsQueryKey(range: DateRange) {
  return [EVENTS_KEY, isoDate(range.from), isoDate(range.to)] as const;
}

export function useEventsInRange(range: DateRange, timeZone: string = DEFAULT_TIME_ZONE, enabled = true) {
  const query = useQuery({
    queryKey: eventsQueryKey(range),
    enabled,
    // Paging months/weeks keeps the old events on screen until the new range arrives,
    // so a slow network doesn't flash an empty grid that looks like "no events".
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const events = await api.fetchEvents(isoDate(range.from), isoDate(range.to));
      const exceptions = await api.fetchExceptions(events.map((e) => e.id));
      return { events, exceptions };
    },
  });
  const occurrences = query.data ? occurrencesForEvents(query.data.events, query.data.exceptions, range, timeZone) : [];
  return { ...query, occurrences };
}

// Wraps a mutation's API call so a write rejected by RLS (42501) re-checks the session (F7)
// before the error reaches the caller — a kicked-out device then shows "Bạn đã bị đăng xuất"
// instead of a generic error toast.
export function useForbiddenGuard() {
  const { recheckSession } = useAuth();
  return async <T>(run: () => Promise<T>): Promise<T> => {
    try {
      return await run();
    } catch (e) {
      if (e instanceof api.ForbiddenError) await recheckSession();
      throw e;
    }
  };
}

function useInvalidateEvents() {
  const queryClient = useQueryClient();
  return () => {
    void resyncReminders();
    return queryClient.invalidateQueries({ queryKey: [EVENTS_KEY] });
  };
}

export type SaveEventVars = { id?: string; updatedAt?: string; input: EventInput; clearExceptions?: boolean };

export function useSaveEvent() {
  const guard = useForbiddenGuard();
  const invalidate = useInvalidateEvents();
  return useMutation({
    mutationFn: (vars: SaveEventVars) =>
      guard(() =>
        vars.id && vars.updatedAt
          ? api.updateEvent(vars.id, vars.updatedAt, vars.input, { clearExceptions: vars.clearExceptions })
          : api.createEvent(vars.input),
      ),
    onSuccess: (row) => {
      googleSync.afterEventSaved(row.id);
      return invalidate();
    },
  });
}

export function useDeleteEvent() {
  const guard = useForbiddenGuard();
  const invalidate = useInvalidateEvents();
  return useMutation({
    mutationFn: (id: string) => guard(() => googleSync.deleteEvent(id)),
    onSuccess: invalidate,
  });
}

export type SetExceptionVars = { eventId: string; occurrenceDate: string; kind: ExceptionKind; override?: EventInput };

// "Chỉ lần này" — sửa (kind 'override') hoặc xoá (kind 'skip') một lần lặp.
export function useSetOccurrenceException() {
  const guard = useForbiddenGuard();
  const invalidate = useInvalidateEvents();
  return useMutation({
    mutationFn: (vars: SetExceptionVars) => guard(() => api.upsertException(vars.eventId, vars.occurrenceDate, vars.kind, vars.override)),
    onSuccess: (_, vars) => {
      googleSync.afterExceptionSaved(vars.eventId, vars.occurrenceDate);
      return invalidate();
    },
  });
}
