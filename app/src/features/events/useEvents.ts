import { keepPreviousData, useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';

import { useAuth } from '@/features/auth/AuthProvider';
import * as googleSync from '@/features/google/sync';
import { resyncReminders } from '@/features/reminders/reminderSync';
import { narrowestCovering } from '@/lib/calendar/coveringRange';
import { isoDate } from '@/lib/calendar/monthGrid';
import { DEFAULT_TIME_ZONE } from '@/lib/calendar/timeZone';
import type { DateRange } from '@/lib/recurrence';
import * as api from './api';
import type { EventInput, EventRow } from './event';
import { occurrencesForEvents, type ExceptionKind, type ExceptionRow } from './occurrences';

export const EVENTS_KEY = 'events';

export function eventsQueryKey(range: DateRange) {
  return [EVENTS_KEY, isoDate(range.from), isoDate(range.to)] as const;
}

type EventsData = { events: EventRow[]; exceptions: ExceptionRow[] };

function eventsQueryOptions(range: DateRange) {
  return {
    queryKey: eventsQueryKey(range),
    queryFn: async (): Promise<EventsData> => {
      const events = await api.fetchEvents(isoDate(range.from), isoDate(range.to));
      const exceptions = await api.fetchExceptions(events.map((e) => e.id));
      return { events, exceptions };
    },
  };
}

// A wider range already loaded (e.g. the month holding the day an event detail opens on)
// holds every event of this one — show it at once while the exact range loads.
function cachedCovering(queryClient: QueryClient, range: DateRange): EventsData | undefined {
  const loaded = queryClient
    .getQueriesData<EventsData>({ queryKey: [EVENTS_KEY] })
    .flatMap(([key, data]) => (data ? [{ from: key[1] as string, to: key[2] as string, value: data }] : []));
  return narrowestCovering(loaded, isoDate(range.from), isoDate(range.to));
}

export function useEventsInRange(range: DateRange, timeZone: string = DEFAULT_TIME_ZONE, enabled = true) {
  const queryClient = useQueryClient();
  const query = useQuery({
    ...eventsQueryOptions(range),
    enabled,
    // Paging months/weeks keeps the old events on screen until the new range arrives,
    // so a slow network doesn't flash an empty grid that looks like "no events".
    placeholderData: (previous) => cachedCovering(queryClient, range) ?? keepPreviousData(previous),
  });
  const { data } = query;
  const { from, to } = range;
  // Recompute only when the data or the range changes — not on every re-render of the screen,
  // which would also rebuild every month cell's bars.
  const occurrences = useMemo(
    () => (data ? occurrencesForEvents(data.events, data.exceptions, { from, to }, timeZone) : []),
    [data, from, to, timeZone],
  );
  return { ...query, occurrences };
}

// Loads the periods next to the one on screen once it has arrived, so paging needs no wait.
export function usePrefetchEvents(ranges: DateRange[], enabled: boolean) {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!enabled) return;
    for (const range of ranges) void queryClient.prefetchQuery(eventsQueryOptions(range));
  }, [queryClient, ranges, enabled]);
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

export type SaveEventVars = { id: string; updatedAt?: string; input: EventInput; clearExceptions?: boolean };

export function useSaveEvent() {
  const guard = useForbiddenGuard();
  const invalidate = useInvalidateEvents();
  return useMutation({
    mutationFn: (vars: SaveEventVars) =>
      guard(() =>
        vars.updatedAt
          ? api.updateEvent(vars.id, vars.updatedAt, vars.input, { clearExceptions: vars.clearExceptions })
          : api.createEvent(vars.id, vars.input),
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
