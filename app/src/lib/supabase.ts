import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

import { isDeviceOnline, reportServerDown, reportServerOk } from '@/lib/connection';
import { timeoutError } from '@/lib/errors/classifyError';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!url || !key) {
  console.warn('Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY in app/.env');
}

const TIMEOUT_MS = 15_000;
// Edge Functions (bug report email) and file uploads are slower by nature.
const LONG_TIMEOUT_MS = 60_000;

// Resolves once the response headers arrive; a stuck request is cut and counts as a server fault.
export async function timedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const href = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  const ms = /\/(functions|storage)\/v1\//.test(href) ? LONG_TIMEOUT_MS : TIMEOUT_MS;
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, ms);
  const callerSignal = init?.signal;
  if (callerSignal) {
    if (callerSignal.aborted) controller.abort();
    else callerSignal.addEventListener('abort', () => controller.abort());
  }
  try {
    const res = await fetch(input, { ...init, signal: controller.signal });
    if (res.status >= 500) reportServerDown();
    else reportServerOk();
    return res;
  } catch (e) {
    if (timedOut) {
      reportServerDown();
      throw timeoutError();
    }
    if (!callerSignal?.aborted && isDeviceOnline()) reportServerDown();
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

export const supabase = createClient(url, key, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  // Android's HTTP layer caches GET responses: an unchanged query URL (settings, the same event
  // range) returned data from before the last write. Always go to the server.
  global: { headers: { 'Cache-Control': 'no-cache' }, fetch: timedFetch },
});

AppState.addEventListener('change', (state) => {
  if (state === 'active') supabase.auth.startAutoRefresh();
  else supabase.auth.stopAutoRefresh();
});
