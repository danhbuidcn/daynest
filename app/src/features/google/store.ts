import * as Crypto from 'expo-crypto';

import { toEvent, toEventColumns, type EventInput, type EventRow, type EventTableRow, type GoogleStatus } from '@/features/events/event';
import type { GoogleEvent } from '@/lib/google/types';
import { supabase } from '@/lib/supabase';

// Daynest-side reads/writes the sync needs: the `google_*` columns that the calendar screens never touch.
export type SyncedEvent = EventRow & {
  googleEventId: string | null;
  etag: string | null;
  googleUpdatedAt: string | null;
  status: GoogleStatus;
  readonly: boolean;
  deletedAt: string | null;
};

type Row = EventTableRow & {
  google_event_id: string | null;
  google_etag: string | null;
  google_updated_at: string | null;
  google_status: GoogleStatus;
  google_readonly: boolean;
  deleted_at: string | null;
};

function toSynced(row: Row): SyncedEvent {
  return {
    ...toEvent(row),
    googleEventId: row.google_event_id,
    etag: row.google_etag,
    googleUpdatedAt: row.google_updated_at,
    status: row.google_status,
    readonly: row.google_readonly,
    deletedAt: row.deleted_at,
  };
}

async function rows(query: PromiseLike<{ data: unknown; error: unknown }>): Promise<SyncedEvent[]> {
  const { data, error } = await query;
  if (error) throw error;
  return ((data as Row[] | null) ?? []).map(toSynced);
}

export async function getEvent(id: string): Promise<SyncedEvent | null> {
  return (await rows(supabase.from('events').select('*').eq('id', id)))[0] ?? null;
}

// Includes rows deleted in the app but not yet on Google, so a pull doesn't bring them back.
export async function byGoogleIds(ids: string[]): Promise<Map<string, SyncedEvent>> {
  const map = new Map<string, SyncedEvent>();
  for (let i = 0; i < ids.length; i += 100) {
    for (const e of await rows(supabase.from('events').select('*').in('google_event_id', ids.slice(i, i + 100)))) map.set(e.googleEventId!, e);
  }
  return map;
}

// Daynest events in `year`'s scope that Google hasn't seen yet (F4 "Bật đồng bộ" step 3).
export function unlinkedInYear(year: number) {
  return rows(
    supabase
      .from('events')
      .select('*')
      .is('google_event_id', null)
      .is('deleted_at', null)
      .neq('repeat', 'lunar_yearly')
      .lte('span_start', `${year}-12-31`)
      .gte('span_end', `${year}-01-01`),
  );
}

export function pendingEvents() {
  return rows(supabase.from('events').select('*').eq('google_status', 'pending'));
}

export async function pendingExceptions(): Promise<{ eventId: string; occurrenceDate: string }[]> {
  const { data, error } = await supabase.from('event_exceptions').select('event_id, occurrence_date').eq('google_status', 'pending');
  if (error) throw error;
  return (data ?? []).map((r) => ({ eventId: r.event_id as string, occurrenceDate: r.occurrence_date as string }));
}

export async function markLinked(id: string, g: GoogleEvent): Promise<void> {
  const { error } = await supabase
    .from('events')
    .update({ google_event_id: g.id, google_etag: g.etag ?? null, google_updated_at: g.updated ?? null, google_status: 'synced' })
    .eq('id', id);
  if (error) throw error;
}

export async function markPending(id: string): Promise<void> {
  await supabase.from('events').update({ google_status: 'pending' }).eq('id', id);
}

// Pull: write Google's version over the linked row, or add a new one.
export async function saveFromGoogle(existingId: string | null, fields: EventInput, g: GoogleEvent, readonly: boolean): Promise<string> {
  const columns = {
    ...toEventColumns(fields),
    google_event_id: g.id,
    google_etag: g.etag ?? null,
    google_updated_at: g.updated ?? null,
    google_status: 'synced',
    google_readonly: readonly,
    deleted_at: null,
  };
  if (existingId) {
    const { error } = await supabase.from('events').update(columns).eq('id', existingId);
    if (error) throw error;
    return existingId;
  }
  const id = Crypto.randomUUID();
  const { error } = await supabase.from('events').insert({ id, ...columns });
  if (error) throw error;
  return id;
}

export async function deleteLocal(id: string): Promise<void> {
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw error;
}

// Laps of a series with a recurrence Daynest can't express are stored one row each, `<id>_<start>`.
export async function deleteLapsOf(googleId: string): Promise<void> {
  const { error } = await supabase.from('events').delete().like('google_event_id', `${googleId}\\_%`);
  if (error) throw error;
}

export async function hasLaps(googleId: string): Promise<boolean> {
  const { count, error } = await supabase
    .from('events')
    .select('id', { count: 'exact', head: true })
    .like('google_event_id', `${googleId}\\_%`);
  if (error) throw error;
  return (count ?? 0) > 0;
}

// Deleted in the app while Google still has it: hidden now, removed once Google confirms (db.md `deleted_at`).
export async function softDelete(id: string): Promise<void> {
  const { error } = await supabase.from('events').update({ deleted_at: new Date().toISOString(), google_status: 'pending' }).eq('id', id);
  if (error) throw error;
}

export async function exceptionKind(eventId: string, occurrenceDate: string): Promise<'skip' | 'override' | null> {
  const { data, error } = await supabase
    .from('event_exceptions')
    .select('kind')
    .eq('event_id', eventId)
    .eq('occurrence_date', occurrenceDate)
    .maybeSingle();
  if (error) throw error;
  return (data?.kind as 'skip' | 'override' | undefined) ?? null;
}

export async function saveExceptionFromGoogle(eventId: string, occurrenceDate: string, fields: EventInput | null): Promise<void> {
  const payload: Record<string, unknown> = {
    event_id: eventId,
    occurrence_date: occurrenceDate,
    kind: fields ? 'override' : 'skip',
    google_status: 'synced',
  };
  if (fields) {
    payload.title = fields.title;
    payload.note = fields.note === '' ? null : fields.note;
    payload.color = fields.color;
    payload.all_day = fields.allDay;
    payload.starts_at = fields.startsAt;
    payload.ends_at = fields.endsAt;
    payload.start_date = fields.startDate;
    payload.end_date = fields.endDate;
    payload.reminder_minutes = fields.reminderMinutes;
  }
  const { error } = await supabase.from('event_exceptions').upsert(payload, { onConflict: 'event_id,occurrence_date' });
  if (error) throw error;
}

export async function setExceptionStatus(eventId: string, occurrenceDate: string, status: GoogleStatus): Promise<void> {
  await supabase.from('event_exceptions').update({ google_status: status }).eq('event_id', eventId).eq('occurrence_date', occurrenceDate);
}
