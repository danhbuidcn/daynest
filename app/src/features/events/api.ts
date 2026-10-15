
import { isoDate, parseIsoDate } from '@/lib/calendar/monthGrid';
import { jdFromDate, jdToDate } from '@/lib/lunar';
import { supabase } from '@/lib/supabase';
import { toEvent, toEventColumns, type EventInput, type EventRow, type EventTableRow } from './event';
import type { ExceptionKind, ExceptionRow } from './occurrences';

// A write rejected by Postgres RLS (42501) — most likely this device got kicked out (F7); the
// caller (useEvents.ts) re-checks the session and surfaces the right message.
export class ForbiddenError extends Error {
  constructor() {
    super('forbidden');
  }
}

// `update ... where id and updated_at` matched 0 rows: someone else saved this event first (F2).
export class ConflictError extends Error {
  constructor() {
    super('conflict');
  }
}

function classify(error: unknown): Error {
  if (error && typeof error === 'object' && (error as { code?: string }).code === '42501') return new ForbiddenError();
  if (error instanceof Error) return error;
  return new Error(JSON.stringify(error));
}

// span_start/span_end of timed events hold the UTC date (event.ts), which can be a day off the
// user's local date — so fetch one extra day each side; occurrence expansion trims to the range.
const EXCEPTION_COLUMNS =
  'id, event_id, occurrence_date, kind, title, note, color, all_day, starts_at, ends_at, start_date, end_date, reminder_minutes';

type ExceptionTableRow = {
  id: string;
  event_id: string;
  occurrence_date: string;
  kind: string;
  title: string | null;
  note: string | null;
  color: ExceptionRow['color'];
  all_day: boolean | null;
  starts_at: string | null;
  ends_at: string | null;
  start_date: string | null;
  end_date: string | null;
  reminder_minutes: number[] | null;
};

const toException = (row: ExceptionTableRow): ExceptionRow => ({
  id: row.id,
  eventId: row.event_id,
  occurrenceDate: row.occurrence_date,
  kind: row.kind as ExceptionKind,
  title: row.title,
  note: row.note,
  color: row.color,
  allDay: row.all_day,
  startsAt: row.starts_at,
  endsAt: row.ends_at,
  startDate: row.start_date,
  endDate: row.end_date,
  reminderMinutes: row.reminder_minutes,
});

const shiftIso = (iso: string, days: number) => isoDate(jdToDate(jdFromDate(parseIsoDate(iso)) + days));

// Events and their exceptions in one request (nested select).
export async function fetchEvents(fromIso: string, toIso: string): Promise<{ events: EventRow[]; exceptions: ExceptionRow[] }> {
  const { data, error } = await supabase
    .from('events')
    .select(
      'id, title, note, color, all_day, starts_at, ends_at, start_date, end_date, repeat, repeat_interval, repeat_until, lunar_month, lunar_day, reminder_minutes, updated_at, google_event_id, google_status, google_readonly, event_exceptions(' + EXCEPTION_COLUMNS + ')',
    )
    .is('deleted_at', null)
    .lte('span_start', shiftIso(toIso, 1))
    .gte('span_end', shiftIso(fromIso, -1));
  if (error) throw classify(error);
  const rows = (data ?? []) as unknown as (EventTableRow & { event_exceptions: ExceptionTableRow[] | null })[];
  return { events: rows.map(toEvent), exceptions: rows.flatMap((row) => (row.event_exceptions ?? []).map(toException)) };
}

export async function fetchExceptions(eventIds: string[]): Promise<ExceptionRow[]> {
  if (eventIds.length === 0) return [];
  const { data, error } = await supabase.from('event_exceptions').select(EXCEPTION_COLUMNS).in('event_id', eventIds);
  if (error) throw classify(error);
  return ((data ?? []) as unknown as ExceptionTableRow[]).map(toException);
}

// `id` is generated once when the form opens: a retry after a lost response upserts the same
// row instead of creating a second event.
export async function createEvent(id: string, input: EventInput): Promise<EventRow> {
  const { data, error } = await supabase
    .from('events')
    .upsert({ id, ...toEventColumns(input) }, { onConflict: 'id' })
    .select()
    .single();
  if (error) throw classify(error);
  return toEvent(data as EventTableRow);
}

// `clearExceptions`: the repeat type or start date changed, so existing occurrence exceptions
// (keyed by the old anchor dates) no longer match anything and must be dropped (F2).
export async function updateEvent(
  id: string,
  readUpdatedAt: string,
  input: EventInput,
  { clearExceptions = false }: { clearExceptions?: boolean } = {},
): Promise<EventRow> {
  const { data, error } = await supabase
    .from('events')
    .update(toEventColumns(input))
    .eq('id', id)
    .eq('updated_at', readUpdatedAt)
    .select();
  if (error) throw classify(error);
  if (!data || data.length === 0) throw new ConflictError();
  if (clearExceptions) {
    const { error: delError } = await supabase.from('event_exceptions').delete().eq('event_id', id);
    if (delError) throw classify(delError);
  }
  return toEvent(data[0] as EventTableRow);
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw classify(error);
}

// "Chỉ lần này" — xoá: a `skip` exception; sửa: an `override` exception carrying the edited values.
export async function upsertException(
  eventId: string,
  occurrenceDate: string,
  kind: ExceptionKind,
  override?: EventInput,
): Promise<ExceptionRow> {
  const payload: Record<string, unknown> = { event_id: eventId, occurrence_date: occurrenceDate, kind };
  if (kind === 'override' && override) {
    payload.title = override.title;
    payload.note = override.note === '' ? null : override.note;
    payload.color = override.color;
    payload.all_day = override.allDay;
    payload.starts_at = override.startsAt;
    payload.ends_at = override.endsAt;
    payload.start_date = override.startDate;
    payload.end_date = override.endDate;
    payload.reminder_minutes = override.reminderMinutes;
  }
  const { data, error } = await supabase
    .from('event_exceptions')
    .upsert(payload, { onConflict: 'event_id,occurrence_date' })
    .select(EXCEPTION_COLUMNS)
    .single();
  if (error) throw classify(error);
  return toException(data as unknown as ExceptionTableRow);
}
