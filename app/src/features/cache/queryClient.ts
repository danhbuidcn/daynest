import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { defaultShouldDehydrateQuery, QueryClient, type Query } from '@tanstack/react-query';
import type { PersistQueryClientOptions } from '@tanstack/react-query-persist-client';
import Constants from 'expo-constants';

const MAX_AGE = 7 * 24 * 60 * 60 * 1000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
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
