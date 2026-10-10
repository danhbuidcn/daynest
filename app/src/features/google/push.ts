import { fetchExceptions } from '@/features/events/api';
import { occurrencesForEvent } from '@/features/events/occurrences';
import { parseIsoDate } from '@/lib/calendar/monthGrid';
import { shiftByDays, todayIn } from '@/lib/calendar/timeZone';
import { fromGoogle, toGoogleBody } from '@/lib/google/mapping';
import { googleIdFor, inSyncScope, instanceIdFor } from '@/lib/google/scope';
import type { GoogleEvent } from '@/lib/google/types';
import { jdFromDate } from '@/lib/lunar';
import * as google from './client';
import { GoogleAuthError, isStatus } from './client';
import * as store from './store';
import type { SyncedEvent } from './store';

export type SyncContext = { timeZone: string; year: number; fallbackTitle: string };

// Daynest → Google for one event (F4 "Đang bật"): insert / patch / delete. A failure leaves it
// `pending` for the next sync; Google refusing an edit (not the user's event) keeps Google's copy.
export async function pushEvent(id: string, ctx: SyncContext): Promise<void> {
  const e = await store.getEvent(id);
  if (!e) return;
  if (e.deletedAt) return pushDeletion(e);
  if (e.repeat === 'lunar_yearly' || e.readonly) return;
  if (!e.googleEventId && !inSyncScope(e, ctx.year, ctx.timeZone)) return;
  const isNew = !e.googleEventId;
  try {
    const g = isNew ? await create(e, ctx) : await update(e, ctx);
    if (!g) return;
    await store.markLinked(e.id, g);
    if (isNew && e.repeat !== 'none') {
      for (const x of await fetchExceptions([e.id])) await pushException(e.id, x.occurrenceDate, ctx);
    }
  } catch (err) {
    if (!isStatus(err, 403)) await store.markPending(e.id);
    throw err;
  }
}

async function create(e: SyncedEvent, ctx: SyncContext): Promise<GoogleEvent> {
  const body = toGoogleBody(e, ctx.timeZone);
  const id = googleIdFor(e.id);
  try {
    return await google.insertEvent({ ...body, id });
  } catch (err) {
    // Already there (a resend, the other device, or a re-enable): bring it back in line instead.
    if (isStatus(err, 409)) return google.patchEvent(id, { ...body, status: 'confirmed' });
    throw err;
  }
}

async function update(e: SyncedEvent, ctx: SyncContext): Promise<GoogleEvent | null> {
  const body = toGoogleBody(e, ctx.timeZone);
  const gid = e.googleEventId!;
  try {
    return await google.patchEvent(gid, body, e.etag ?? undefined);
  } catch (err) {
    if (isStatus(err, 412)) {
      // Changed on Google since our last pull: the later edit wins (F4).
      const fresh = await google.getEvent(gid);
      if (fresh.updated && new Date(fresh.updated) > new Date(e.updatedAt)) return applyGoogle(e, fresh, ctx);
      return google.patchEvent(gid, body);
    }
    if (isStatus(err, 404, 410)) return google.insertEvent(body);
    if (isStatus(err, 403)) await applyGoogle(e, await google.getEvent(gid), ctx).catch(() => null);
    throw err;
  }
}

async function applyGoogle(e: SyncedEvent, g: GoogleEvent, ctx: SyncContext): Promise<null> {
  const mapped = fromGoogle(g, { timeZone: ctx.timeZone, fallbackTitle: ctx.fallbackTitle });
  if (mapped) await store.saveFromGoogle(e.id, mapped.fields, g, mapped.readonly);
  return null;
}

export async function pushDeletion(e: SyncedEvent): Promise<void> {
  if (e.googleEventId) await google.deleteEvent(e.googleEventId);
  await store.deleteLocal(e.id);
}

// "Chỉ lần này": skip → delete that lap on Google, override → patch that lap.
export async function pushException(eventId: string, occurrenceDate: string, ctx: SyncContext): Promise<void> {
  const e = await store.getEvent(eventId);
  if (!e?.googleEventId || e.readonly || e.repeat === 'none' || e.repeat === 'lunar_yearly') return;
  const kind = await store.exceptionKind(eventId, occurrenceDate);
  if (!kind) return;
  const instanceId = instanceIdFor(e.googleEventId, originalStart(e, occurrenceDate, ctx.timeZone));
  try {
    if (kind === 'skip') await google.deleteEvent(instanceId);
    else {
      const date = parseIsoDate(occurrenceDate);
      const exceptions = await fetchExceptions([eventId]);
      const occ = occurrencesForEvent(e, exceptions, { from: date, to: date }, ctx.timeZone).find((o) => o.occurrenceDate === occurrenceDate);
      if (!occ) return;
      await google.patchEvent(instanceId, toGoogleBody({ ...e, ...occ }, ctx.timeZone, { instance: true }));
    }
    await store.setExceptionStatus(eventId, occurrenceDate, 'synced');
  } catch (err) {
    await store.setExceptionStatus(eventId, occurrenceDate, 'pending');
    throw err;
  }
}

// The lap's start as the series defines it (before any override), which is what Google keys laps by.
function originalStart(e: SyncedEvent, occurrenceDate: string, timeZone: string): { date?: string; dateTime?: string } {
  if (e.allDay) return { date: occurrenceDate };
  const anchor = new Date(e.startsAt!);
  const delta = jdFromDate(parseIsoDate(occurrenceDate)) - jdFromDate(todayIn(timeZone, anchor));
  return { dateTime: shiftByDays(anchor, delta, timeZone).toISOString() };
}

// Retries everything left `pending` by an earlier failure. Auth errors stop the run (reconnect needed).
export async function pushPending(ctx: SyncContext): Promise<void> {
  for (const e of await store.pendingEvents()) await guarded(() => pushEvent(e.id, ctx));
  for (const x of await store.pendingExceptions()) await guarded(() => pushException(x.eventId, x.occurrenceDate, ctx));
}

export async function guarded(run: () => Promise<void>): Promise<void> {
  try {
    await run();
  } catch (e) {
    if (e instanceof GoogleAuthError) throw e;
  }
}
