import { deleteEvent as deleteLocalEvent } from '@/features/events/api';
import { todayIn } from '@/lib/calendar/timeZone';
import { GoogleAuthError, isStatus, requestCalendarAccess } from './client';
import { applyChanges, listChanges } from './pull';
import { guarded, pushDeletion, pushEvent, pushException, pushPending, type SyncContext } from './push';
import { EMPTY_STATE, loadSyncState, saveSyncState, type SyncState } from './state';
import * as store from './store';

// F4 orchestration. Plain module state (like reminderSync) so event mutations can push without
// threading settings through every caller; screens read it through useGoogleSync().
export type SyncStatus = {
  enabled: boolean;
  lastSyncedAt: string | null;
  syncing: boolean;
  // Only for the first sync after turning it on (màn 22).
  progress: { done: number; total: number } | null;
  needsReconnect: boolean;
};
export type SyncOutcome = 'ok' | 'reconnect' | 'failed';

type Config = { signedIn: boolean; timeZone: string; fallbackTitle: string; onChanged: () => void };

const STALE_MS = 5 * 60 * 1000;
const INITIAL: SyncStatus = { enabled: false, lastSyncedAt: null, syncing: false, progress: null, needsReconnect: false };

let config: Config | null = null;
let persisted: SyncState = EMPTY_STATE;
let status: SyncStatus = INITIAL;
let running: Promise<SyncOutcome> | null = null;
let pushChain: Promise<void> = Promise.resolve();
let lastPullAt = 0;
const listeners = new Set<() => void>();

function set(patch: Partial<SyncStatus>) {
  status = { ...status, ...patch };
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => void listeners.delete(listener);
}

export const getStatus = () => status;

export function configureGoogleSync(next: Config) {
  const wasSignedIn = config?.signedIn ?? false;
  config = next;
  if (!next.signedIn) {
    persisted = EMPTY_STATE;
    lastPullAt = 0;
    set(INITIAL);
  } else if (!wasSignedIn) {
    void load();
  }
}

async function load() {
  try {
    persisted = await loadSyncState();
    set({ enabled: persisted.enabled, lastSyncedAt: persisted.lastSyncedAt });
    if (persisted.enabled) void run({});
  } catch {
    // Offline at start-up: stays off-looking until the next foreground.
  }
}

function context(): SyncContext {
  const c = config!;
  return { timeZone: c.timeZone, year: todayIn(c.timeZone).year, fallbackTitle: c.fallbackTitle };
}

export async function enableSync(): Promise<SyncOutcome | 'denied'> {
  const granted = await requestCalendarAccess().catch(() => false);
  if (!granted) return 'denied';
  try {
    await saveSyncState({ enabled: true, syncToken: null });
  } catch {
    return 'failed';
  }
  persisted = { ...persisted, enabled: true, syncToken: null };
  set({ enabled: true, needsReconnect: false });
  return run({ full: true, withProgress: true });
}

// F4 "Tắt": nothing is deleted on either side; linked rows keep `google_event_id` for re-pairing.
export async function disableSync(): Promise<void> {
  await saveSyncState({ enabled: false, syncToken: null });
  persisted = { ...persisted, enabled: false, syncToken: null };
  set({ enabled: false, needsReconnect: false });
}

export async function reconnect(): Promise<SyncOutcome> {
  const granted = await requestCalendarAccess().catch(() => false);
  if (!granted) return 'reconnect';
  set({ needsReconnect: false });
  return run({});
}

export function syncNow(): Promise<SyncOutcome> {
  return run({});
}

// Opening the app / back to foreground pulls only if the last pull is older than 5 minutes (F4).
export function syncIfStale() {
  if (status.enabled && Date.now() - lastPullAt > STALE_MS) void run({});
}

function run({ full = false, withProgress = false }): Promise<SyncOutcome> {
  if (!config?.signedIn || !status.enabled) return Promise.resolve('ok');
  if (running) return running;
  running = (async (): Promise<SyncOutcome> => {
    set({ syncing: true, progress: withProgress ? { done: 0, total: 0 } : null });
    try {
      await syncOnce(full, withProgress);
      set({ needsReconnect: false });
      return 'ok';
    } catch (e) {
      if (e instanceof GoogleAuthError) {
        set({ needsReconnect: true });
        return 'reconnect';
      }
      return 'failed';
    } finally {
      running = null;
      set({ syncing: false, progress: null });
      config?.onChanged();
    }
  })();
  return running;
}

async function syncOnce(forceFull: boolean, withProgress: boolean) {
  const ctx = context();
  const full = forceFull || !persisted.syncToken || persisted.syncedYear !== ctx.year;
  let changes;
  try {
    changes = await listChanges(ctx, full ? null : persisted.syncToken);
  } catch (e) {
    // 410 Gone: the sync token expired — pull the whole year again and re-pair by google_event_id.
    if (!isStatus(e, 410)) throw e;
    changes = await listChanges(ctx, null);
  }
  const toPush = full || !persisted.syncToken ? await store.unlinkedInYear(ctx.year) : [];
  const total = changes.items.length + toPush.length;
  let done = 0;
  const tick = () => {
    done += 1;
    if (withProgress) set({ progress: { done, total } });
  };
  if (withProgress) set({ progress: { done, total } });

  await applyChanges(ctx, changes, tick);
  for (const e of toPush) {
    await guarded(() => pushEvent(e.id, ctx));
    tick();
  }
  await pushPending(ctx);

  const now = new Date().toISOString();
  await saveSyncState({ syncToken: changes.nextSyncToken, syncedYear: ctx.year, lastSyncedAt: now });
  persisted = { ...persisted, syncToken: changes.nextSyncToken, syncedYear: ctx.year, lastSyncedAt: now };
  lastPullAt = Date.now();
  set({ lastSyncedAt: now });
}

// Daynest → Google right after a DB write; queued so pushes never overlap.
function queuePush(push: (ctx: SyncContext) => Promise<void>) {
  if (!config?.signedIn || !status.enabled) return;
  pushChain = pushChain
    .then(() => push(context()))
    .catch((e) => {
      if (e instanceof GoogleAuthError) set({ needsReconnect: true });
    })
    .finally(() => config?.onChanged());
}

export const afterEventSaved = (id: string) => queuePush((ctx) => pushEvent(id, ctx));
export const afterExceptionSaved = (eventId: string, occurrenceDate: string) => queuePush((ctx) => pushException(eventId, occurrenceDate, ctx));

// A linked event, while syncing is on, is hidden first and removed once Google confirms (F4 § Xoá).
export async function deleteEvent(id: string): Promise<void> {
  const linked = status.enabled ? await store.getEvent(id) : null;
  if (!linked?.googleEventId) return deleteLocalEvent(id);
  await store.softDelete(id);
  queuePush(() => pushDeletion(linked));
}
