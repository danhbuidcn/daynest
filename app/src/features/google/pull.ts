import { fromGoogle, keepLocalColor, startDateOf } from '@/lib/google/mapping';
import { inSyncScope, yearWindow } from '@/lib/google/scope';
import type { GoogleEvent, GoogleReminders } from '@/lib/google/types';
import * as google from './client';
import type { SyncContext } from './push';
import * as store from './store';

type Defaults = GoogleReminders['overrides'];
type Linked = { id: string; readonly: boolean; repeat: string };

export type PullResult = { items: GoogleEvent[]; defaults: Defaults; nextSyncToken: string | null };

// Full pull: the year's window. Incremental: only what changed since `syncToken` (a `410` from
// Google surfaces as GoogleHttpError for the caller to fall back to a full pull).
export async function listChanges(ctx: SyncContext, syncToken: string | null): Promise<PullResult> {
  const items: GoogleEvent[] = [];
  let defaults: Defaults;
  let pageToken: string | undefined;
  let nextSyncToken: string | null = null;
  do {
    const page = await google.listEvents(syncToken ? { syncToken, pageToken } : { ...yearWindow(ctx.year, ctx.timeZone), pageToken });
    items.push(...(page.items ?? []));
    defaults = page.defaultReminders ?? defaults;
    pageToken = page.nextPageToken;
    nextSyncToken = page.nextSyncToken ?? nextSyncToken;
  } while (pageToken);
  return { items, defaults, nextSyncToken };
}

// Google → Daynest (F4): upsert by `google_event_id`, `cancelled` → delete, changed laps of a
// series → exceptions. Not-yet-linked events outside the year's scope are ignored.
export async function applyChanges(ctx: SyncContext, { items, defaults }: PullResult, onEach: () => void): Promise<void> {
  const series = items.filter((g) => !g.recurringEventId);
  const laps = items.filter((g) => g.recurringEventId);
  const local = await store.byGoogleIds([...new Set([...series.map((g) => g.id), ...laps.map((g) => g.recurringEventId!)])]);
  const linked = new Map<string, Linked>([...local].map(([gid, e]) => [gid, { id: e.id, readonly: e.readonly, repeat: e.repeat }]));
  const complex = new Set<string>();
  const opts = { timeZone: ctx.timeZone, defaultReminders: defaults, fallbackTitle: ctx.fallbackTitle };

  for (const g of series) {
    const mine = local.get(g.id);
    if (g.status === 'cancelled') {
      if (mine) await store.deleteLocal(mine.id);
      await store.deleteLapsOf(g.id);
    } else {
      const mapped = fromGoogle(g, opts);
      if (mapped?.complexRecurrence) {
        if (mine) await store.deleteLocal(mine.id);
        complex.add(g.id);
      } else if (mapped && !mine?.deletedAt && (mine || inSyncScope(mapped.fields, ctx.year, ctx.timeZone))) {
        // Edited here too and not pushed yet: the later edit wins (F4).
        const localNewer = mine?.status === 'pending' && g.updated && new Date(mine.updatedAt) > new Date(g.updated);
        if (!localNewer) {
          const fields = { ...mapped.fields, color: keepLocalColor(mine?.color, g.colorId, mapped.fields.color) };
          const id = await store.saveFromGoogle(mine?.id ?? null, fields, g, mapped.readonly);
          linked.set(g.id, { id, readonly: mapped.readonly, repeat: mapped.fields.repeat });
        }
      }
    }
    onEach();
  }

  for (const g of laps) {
    const parent = linked.get(g.recurringEventId!);
    if (!parent) {
      // A lap of a series kept as separate laps (or one we never imported — then hasLaps is false).
      if (!complex.has(g.recurringEventId!) && (await store.hasLaps(g.recurringEventId!))) complex.add(g.recurringEventId!);
    } else if (parent.repeat !== 'none' && g.originalStartTime) {
      const date = startDateOf(g.originalStartTime, ctx.timeZone);
      const mapped = g.status === 'cancelled' ? null : fromGoogle(g, opts);
      const fields = mapped && { ...mapped.fields, color: keepLocalColor(await store.exceptionColor(parent.id, date), g.colorId, mapped.fields.color) };
      await store.saveExceptionFromGoogle(parent.id, date, fields);
    }
    onEach();
  }

  for (const gid of complex) await refreshLaps(gid, ctx, opts);
}

// A recurrence Daynest can't express: store each lap in the year as its own view-only event.
async function refreshLaps(gid: string, ctx: SyncContext, opts: Parameters<typeof fromGoogle>[1]): Promise<void> {
  await store.deleteLapsOf(gid);
  const { timeMin, timeMax } = yearWindow(ctx.year, ctx.timeZone);
  let pageToken: string | undefined;
  do {
    const page = await google.listInstances(gid, timeMin, timeMax, pageToken).catch((e) => {
      if (google.isStatus(e, 404, 410)) return { items: [], nextPageToken: undefined };
      throw e;
    });
    for (const lap of page.items ?? []) {
      if (lap.status === 'cancelled') continue;
      const mapped = fromGoogle(lap, opts);
      if (mapped) await store.saveFromGoogle(null, mapped.fields, lap, true);
    }
    pageToken = page.nextPageToken;
  } while (pageToken);
}
