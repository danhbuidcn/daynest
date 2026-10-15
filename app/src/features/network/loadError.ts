import { ConnectionError } from '@/lib/errors/classifyError';

type QueryLike = { isError: boolean; isPlaceholderData?: boolean; fetchStatus: string; error: unknown; data: unknown };

// What to show for a read that has no data of its own: its error, or — offline — a query waiting
// for the network (it neither loads nor fails, which would look like "nothing here"). Data kept
// from the previous period (placeholder) is not its own.
export function loadError(q: QueryLike): unknown | null {
  if (q.data !== undefined && !q.isPlaceholderData) return null;
  if (q.isError) return q.error ?? new Error('load');
  if (q.fetchStatus === 'paused') return new ConnectionError('offline');
  return null;
}
