import { ConnectionError } from '@/lib/errors/classifyError';

export type ConnectionIssue = 'offline' | 'server' | null;

type State = { online: boolean; serverDown: boolean };

let state: State = { online: true, serverDown: false };
const listeners = new Set<() => void>();

function set(next: Partial<State>) {
  const merged = { ...state, ...next };
  if (merged.online === state.online && merged.serverDown === state.serverDown) return;
  state = merged;
  listeners.forEach((l) => l());
}

export const issueOf = (s: State): ConnectionIssue => (!s.online ? 'offline' : s.serverDown ? 'server' : null);

export const getConnection = () => state;
export const getIssue = () => issueOf(state);
export const isDeviceOnline = () => state.online;

export function subscribeConnection(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const setDeviceOnline = (online: boolean) => set({ online });

// Called by the request layer. A failure while the device itself is offline says nothing about the server.
export const reportServerDown = () => {
  if (state.online) set({ serverDown: true });
};
export const reportServerOk = () => set({ serverDown: false });

// Throws when a write cannot go out; the message screens show comes from classifyError.
export function assertCanWrite() {
  const issue = getIssue();
  if (issue) throw new ConnectionError(issue);
}
