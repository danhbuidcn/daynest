import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { defaultShouldDehydrateQuery, focusManager, MutationCache, onlineManager, QueryClient, type Query } from '@tanstack/react-query';
import type { PersistQueryClientOptions } from '@tanstack/react-query-persist-client';
import Constants from 'expo-constants';
import { AppState } from 'react-native';

import { assertCanWrite, getConnection, subscribeConnection } from '@/lib/connection';

const MAX_AGE = 7 * 24 * 60 * 60 * 1000;

// Paused while the device is offline (the saved copy stays on screen); resumes and refetches on reconnect.
onlineManager.setEventListener((setOnline) => subscribeConnection(() => setOnline(getConnection().online)));
// Back in the app: stale (> staleTime) queries on screen reload.
focusManager.setEventListener((handleFocus) => {
  const sub = AppState.addEventListener('change', (state) => handleFocus(state === 'active'));
  return () => sub.remove();
});

export const queryClient = new QueryClient({
  // A write that cannot go out fails here, before the screen's optimistic update.
  mutationCache: new MutationCache({ onMutate: () => assertCanWrite() }),
  defaultOptions: {
    mutations: { networkMode: 'always' },
    queries: {
      retry: 2,
      // Paging back to a month/tab seen in the last 2 minutes needs no request; saves still
      // refetch right away because they invalidate.
      staleTime: 2 * 60 * 1000,
      // Must outlive MAX_AGE, or restored queries are dropped from memory (and storage) early.
      gcTime: MAX_AGE,
    },
  },
});

const persister = createAsyncStoragePersister({ storage: AsyncStorage, key: 'daynest.queryCache' });

export const persistOptions: Omit<PersistQueryClientOptions, 'queryClient'> = {
  persister,
  maxAge: MAX_AGE,
  // A new app version may change the data shape — start from an empty cache.
  buster: Constants.expoConfig?.version ?? '',
  dehydrateOptions: {
    // The open note ('one') is always read fresh, see useNote.
    shouldDehydrateQuery: (q: Query) =>
      defaultShouldDehydrateQuery(q) && !(q.queryKey[0] === 'notes' && q.queryKey[1] === 'one'),
  },
};

// Signing out (or in as someone else) must not leave the last user's events and notes behind.
export async function clearQueryCache() {
  queryClient.clear();
  await persister.removeClient();
}
