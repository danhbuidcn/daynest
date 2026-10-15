import type { QueryClient } from '@tanstack/react-query';

// Edits every loaded query under `root` and returns what puts the old data back.
export function editCached<T>(queryClient: QueryClient, root: string, edit: (data: T, key: readonly unknown[]) => T): () => void {
  const before = queryClient.getQueriesData<T>({ queryKey: [root] });
  for (const [key, data] of before) if (data !== undefined) queryClient.setQueryData(key, edit(data, key));
  return () => {
    for (const [key, data] of before) queryClient.setQueryData(key, data);
  };
}
