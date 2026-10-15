import { useSyncExternalStore } from 'react';

import { getConnection, issueOf, subscribeConnection, type ConnectionIssue } from '@/lib/connection';

// `canWrite` is false when the device is offline or the server is down: saving, deleting and
// ticking are locked, reading from the copy on the device still works.
export function useOnline(): { canWrite: boolean; issue: ConnectionIssue } {
  const issue = issueOf(useSyncExternalStore(subscribeConnection, getConnection));
  return { canWrite: issue === null, issue };
}
