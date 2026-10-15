export type ErrorKind = 'offline' | 'server' | 'signedOut' | 'conflict' | 'other';

export class ConnectionError extends Error {
  constructor(public kind: 'offline' | 'server') {
    super(kind === 'offline' ? 'offline' : 'server_unavailable');
  }
}

export function timeoutError(): Error {
  const e = new Error('timeout');
  e.name = 'TimeoutError';
  return e;
}

const field = (e: unknown, key: string): unknown => (e && typeof e === 'object' ? (e as Record<string, unknown>)[key] : undefined);
const text = (e: unknown) => `${field(e, 'message') ?? ''} ${field(e, 'details') ?? ''}`;

const NETWORK_FAILURE = /network request failed|failed to fetch|network error|networkerror|timed? ?out|econn|enotfound|socket/i;

// `online` is what the device reports: a failed request on a device that is online means the
// server (or the route to it) is at fault.
export function classifyError(e: unknown, online = true): ErrorKind {
  if (e instanceof ConnectionError) return e.kind;
  const message = String(field(e, 'message') ?? '');
  if (message === 'offline') return 'offline';
  if (message === 'conflict') return 'conflict';
  const code = String(field(e, 'code') ?? '');
  if (code === '42501' || code === 'PGRST301' || message === 'forbidden' || /jwt expired/i.test(message)) return 'signedOut';
  const status = Number(field(e, 'status'));
  if (field(e, 'name') === 'TimeoutError' || /^5\d\d$/.test(code) || (status >= 500 && status < 600)) {
    return online ? 'server' : 'offline';
  }
  if (e instanceof TypeError || NETWORK_FAILURE.test(text(e))) return online ? 'server' : 'offline';
  return 'other';
}

// Only a lost connection or a server fault has its own wording; every other kind keeps the
// message of the screen that failed (signed-out and conflict have their own dialogs).
export function errorMessageKey(kind: ErrorKind, fallbackKey: string): string {
  if (kind === 'offline') return 'errors.offline';
  if (kind === 'server') return 'errors.server';
  return fallbackKey;
}
