import { supabase } from '@/lib/supabase';

// `google_sync_state` (db.md) — one row per user; no Google token is ever stored.
export type SyncState = { enabled: boolean; syncToken: string | null; syncedYear: number | null; lastSyncedAt: string | null };

export const EMPTY_STATE: SyncState = { enabled: false, syncToken: null, syncedYear: null, lastSyncedAt: null };

export async function loadSyncState(): Promise<SyncState> {
  const { data, error } = await supabase.from('google_sync_state').select('enabled, sync_token, synced_year, last_synced_at').maybeSingle();
  if (error) throw error;
  if (!data) return EMPTY_STATE;
  return { enabled: data.enabled, syncToken: data.sync_token, syncedYear: data.synced_year, lastSyncedAt: data.last_synced_at };
}

export async function saveSyncState(patch: Partial<SyncState>): Promise<void> {
  const { data } = await supabase.auth.getSession();
  const userId = data.session?.user.id;
  if (!userId) return;
  const row: Record<string, unknown> = { user_id: userId };
  if (patch.enabled !== undefined) row.enabled = patch.enabled;
  if (patch.syncToken !== undefined) row.sync_token = patch.syncToken;
  if (patch.syncedYear !== undefined) row.synced_year = patch.syncedYear;
  if (patch.lastSyncedAt !== undefined) row.last_synced_at = patch.lastSyncedAt;
  const { error } = await supabase.from('google_sync_state').upsert(row, { onConflict: 'user_id' });
  if (error) throw error;
}
