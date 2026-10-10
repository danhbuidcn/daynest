import { GoogleSignin, isCancelledResponse } from '@react-native-google-signin/google-signin';

import type { GoogleBody } from '@/lib/google/mapping';
import type { GoogleEvent, GoogleReminders } from '@/lib/google/types';

export const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.events';
const BASE = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
const RATE_LIMIT_RETRIES = 4;

// The Google token is gone or lacks the Calendar scope — Settings shows "Cần kết nối lại Google" (F4).
export class GoogleAuthError extends Error {
  constructor() {
    super('google-auth');
  }
}

export class GoogleHttpError extends Error {
  constructor(
    public status: number,
    public reason?: string,
  ) {
    super(`google-${status}${reason ? `-${reason}` : ''}`);
  }
}

export const isStatus = (e: unknown, ...codes: number[]) => e instanceof GoogleHttpError && codes.includes(e.status);

function hasScope() {
  return GoogleSignin.getCurrentUser()?.scopes?.includes(CALENDAR_SCOPE) ?? false;
}

// After an app restart the SDK holds no user until signInSilently; the token itself is never stored (F4).
async function accessToken(): Promise<string> {
  if (!GoogleSignin.getCurrentUser()) {
    const res = await GoogleSignin.signInSilently().catch(() => null);
    if (!res || res.type !== 'success') throw new GoogleAuthError();
  }
  if (!hasScope()) throw new GoogleAuthError();
  try {
    return (await GoogleSignin.getTokens()).accessToken;
  } catch {
    throw new GoogleAuthError();
  }
}

// Asks for the Calendar scope (F4 step 1) — false when the user declines.
export async function requestCalendarAccess(): Promise<boolean> {
  if (!GoogleSignin.getCurrentUser()) {
    const silent = await GoogleSignin.signInSilently().catch(() => null);
    if (!silent || silent.type !== 'success') {
      const res = await GoogleSignin.signIn();
      if (isCancelledResponse(res)) return false;
    }
  }
  if (hasScope()) return true;
  const res = await GoogleSignin.addScopes({ scopes: [CALENDAR_SCOPE] });
  if (!res || isCancelledResponse(res)) return false;
  return hasScope();
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

type RequestOptions = { query?: Record<string, string | undefined>; body?: unknown; ifMatch?: string };

async function request<T>(method: string, path: string, opts: RequestOptions = {}): Promise<T> {
  const query = Object.entries(opts.query ?? {})
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v!)}`)
    .join('&');
  const url = `${BASE}${path}${query ? `?${query}` : ''}`;
  let retriedAuth = false;
  for (let attempt = 0; ; attempt++) {
    const token = await accessToken();
    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(opts.body ? { 'Content-Type': 'application/json' } : {}),
        ...(opts.ifMatch ? { 'If-Match': opts.ifMatch } : {}),
      },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    if (res.ok) return (res.status === 204 ? null : await res.json()) as T;

    const err = await res.json().catch(() => null);
    const reason: string | undefined = err?.error?.errors?.[0]?.reason;
    // F4 § Lỗi: a stale token gets one retry with a fresh one.
    if (res.status === 401 && !retriedAuth) {
      retriedAuth = true;
      await GoogleSignin.clearCachedAccessToken(token).catch(() => {});
      continue;
    }
    if (res.status === 401) throw new GoogleAuthError();
    const rateLimited = res.status === 429 || (res.status === 403 && /rateLimitExceeded/.test(reason ?? ''));
    if (rateLimited && attempt < RATE_LIMIT_RETRIES) {
      await wait(1000 * 2 ** attempt);
      continue;
    }
    throw new GoogleHttpError(res.status, reason);
  }
}

export type ListPage = {
  items?: GoogleEvent[];
  nextPageToken?: string;
  nextSyncToken?: string;
  defaultReminders?: GoogleReminders['overrides'];
};

// `singleEvents=false`: a series comes back once (plus its changed/cancelled laps), including
// series that started in an earlier year but still have laps in the window (F4).
export function listEvents(params: { syncToken?: string; timeMin?: string; timeMax?: string; pageToken?: string }) {
  return request<ListPage>('GET', '', { query: { ...params, singleEvents: 'false', maxResults: '250' } });
}

export function listInstances(googleId: string, timeMin: string, timeMax: string, pageToken?: string) {
  return request<ListPage>('GET', `/${encodeURIComponent(googleId)}/instances`, { query: { timeMin, timeMax, pageToken, maxResults: '250' } });
}

export function getEvent(googleId: string) {
  return request<GoogleEvent>('GET', `/${encodeURIComponent(googleId)}`);
}

export function insertEvent(body: GoogleBody & { id?: string }) {
  return request<GoogleEvent>('POST', '', { body });
}

export function patchEvent(googleId: string, body: GoogleBody, etag?: string) {
  return request<GoogleEvent>('PATCH', `/${encodeURIComponent(googleId)}`, { body, ifMatch: etag });
}

// Already gone on Google (404/410) counts as done.
export async function deleteEvent(googleId: string): Promise<void> {
  try {
    await request<null>('DELETE', `/${encodeURIComponent(googleId)}`);
  } catch (e) {
    if (!isStatus(e, 404, 410)) throw e;
  }
}
