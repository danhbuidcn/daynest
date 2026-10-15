import { keepPreviousData, useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';

import { useAuth } from '@/features/auth/AuthProvider';
import * as googleSync from '@/features/google/sync';
import { resyncReminders } from '@/features/reminders/reminderSync';
import { narrowestCovering } from '@/lib/calendar/coveringRange';
import { isoDate } from '@/lib/calendar/monthGrid';
import { DEFAULT_TIME_ZONE } from '@/lib/calendar/timeZone';
import { editCached } from '@/features/cache/editCached';
import { putException, putRow, removeRow } from '@/lib/cache/applySaved';
import type { DateRange } from '@/lib/recurrence';
import * as api from './api';
import { computeSpan, type EventInput, type EventRow } from './event';
import { occurrencesForEvents, type ExceptionKind, type ExceptionRow } from './occurrences';

export const EVENTS_KEY = 'events';

export function eventsQueryKey(range: DateRange) {
  return [EVENTS_KEY, isoDate(range.from), isoDate(range.to)] as const;
}

type EventsData = { events: EventRow[]; exceptions: ExceptionRow[] };

function eventsQueryOptions(range: DateRange) {
  return {
    queryKey: eventsQueryKey(range),
    queryFn: (): Promise<EventsData> => api.fetchEvents(isoDate(range.from), isoDate(range.to)),
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

// A saved write goes straight into every loaded range instead of refetching them all. While a
// fetch is in flight its result may predate the write, so that case falls back to a refetch.
function applyToCache(queryClient: QueryClient, edit: (data: EventsData, from: string, to: string) => EventsData) {
  if (queryClient.isFetching({ queryKey: [EVENTS_KEY] }) > 0) {
    void queryClient.invalidateQueries({ queryKey: [EVENTS_KEY] });
    return;
  }
  for (const [key, data] of queryClient.getQueriesData<EventsData>({ queryKey: [EVENTS_KEY] })) {
    if (data) queryClient.setQueryData(key, edit(data, key[1] as string, key[2] as string));
  }
}

function useCacheEdits() {
  const queryClient = useQueryClient();
  return {
    saved: (row: EventRow, clearExceptions: boolean) =>
      applyToCache(queryClient, (data, from, to) => ({
        events: putRow(data.events, row, computeSpan(row), from, to),
        exceptions: clearExceptions ? data.exceptions.filter((x) => x.eventId !== row.id) : data.exceptions,
      })),
    removed: (id: string) =>
      applyToCache(queryClient, (data) => ({
        events: removeRow(data.events, id),
        exceptions: data.exceptions.filter((x) => x.eventId !== id),
      })),
    exception: (saved: ExceptionRow) =>
      applyToCache(queryClient, (data) => ({
        ...data,
        exceptions: data.events.some((e) => e.id === saved.eventId)
          ? putException(data.exceptions, saved, (x) => x.eventId === saved.eventId && x.occurrenceDate === saved.occurrenceDate)
          : data.exceptions,
      })),
  };
}

// Undoable delete (spec S6 §5): the event, or one lap of it, leaves the screen at once. The write
// comes later; the returned function puts the cache back if the delete is undone or fails.
export function hideEvent(queryClient: QueryClient, id: string): () => void {
  return editCached<EventsData>(queryClient, EVENTS_KEY, (data) => ({
    events: removeRow(data.events, id),
    exceptions: data.exceptions.filter((x) => x.eventId !== id),
  }));
}

export function hideEventOccurrence(queryClient: QueryClient, eventId: string, occurrenceDate: string): () => void {
  const skip: ExceptionRow = {
    id: `pending-${eventId}-${occurrenceDate}`,
    eventId,
    occurrenceDate,
    kind: 'skip',
    title: null,
    note: null,
    color: null,
    allDay: null,
    startsAt: null,
    endsAt: null,
    startDate: null,
    endDate: null,
    reminderMinutes: null,
  };
  return editCached<EventsData>(queryClient, EVENTS_KEY, (data) => ({
    ...data,
    exceptions: putException(data.exceptions, skip, (x) => x.eventId === eventId && x.occurrenceDate === occurrenceDate),
  }));
}

export type SaveEventVars = { id: string; updatedAt?: string; input: EventInput; clearExceptions?: boolean };

export function useSaveEvent() {
  const guard = useForbiddenGuard();
  const edits = useCacheEdits();
  return useMutation({
    mutationFn: (vars: SaveEventVars) =>
      guard(() =>
        vars.updatedAt
          ? api.updateEvent(vars.id, vars.updatedAt, vars.input, { clearExceptions: vars.clearExceptions })
          : api.createEvent(vars.id, vars.input),
      ),
    onSuccess: (row, vars) => {
      googleSync.afterEventSaved(row.id);
      void resyncReminders();
      edits.saved(row, !!vars.clearExceptions);
    },
  });
}

export function useDeleteEvent() {
  const guard = useForbiddenGuard();
  const edits = useCacheEdits();
  return useMutation({
    mutationFn: (id: string) => guard(() => googleSync.deleteEvent(id)),
    onSuccess: (_, id) => {
      void resyncReminders();
      edits.removed(id);
    },
  });
}

export type SetExceptionVars = { eventId: string; occurrenceDate: string; kind: ExceptionKind; override?: EventInput };

// "Chỉ lần này" — sửa (kind 'override') hoặc xoá (kind 'skip') một lần lặp.
export function useSetOccurrenceException() {
  const guard = useForbiddenGuard();
  const edits = useCacheEdits();
  return useMutation({
    mutationFn: (vars: SetExceptionVars) => guard(() => api.upsertException(vars.eventId, vars.occurrenceDate, vars.kind, vars.override)),
    onSuccess: (saved, vars) => {
      googleSync.afterExceptionSaved(vars.eventId, vars.occurrenceDate);
      void resyncReminders();
      edits.exception(saved);
    },
  });
}
