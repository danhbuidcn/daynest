import { ConflictError } from '@/features/events/api';
import { supabase } from '@/lib/supabase';
import type { Frequency } from '@/lib/expenses/recurrence';

export type RecurrenceInput = {
  categoryId: string;
  amount: number;
  note: string;
  frequency: Frequency;
  anchorDay: number;
  nextOn: string;
};

// `id` is generated once when the form opens: a retry after a lost response upserts the same rule.
export async function createRecurrence(id: string, input: RecurrenceInput): Promise<void> {
  const { error } = await supabase.from('expense_recurrences').upsert(
    {
      id,
      category_id: input.categoryId,
      amount: input.amount,
      note: input.note,
      frequency: input.frequency,
      anchor_day: input.anchorDay,
      next_on: input.nextOn,
    },
    { onConflict: 'id' },
  );
  if (error) throw error;
}

// Writes every expense due up to `today` (ISO date in the user's time zone); returns how many.
export async function generateDue(today: string): Promise<number> {
  const { data, error } = await supabase.rpc('generate_due_expenses', { p_today: today });
  if (error) throw error;
  return Number(data ?? 0);
}

export type Recurrence = RecurrenceInput & { id: string; updatedAt: string };

type RecurrenceRow = {
  id: string;
  category_id: string;
  amount: number | string;
  note: string;
  frequency: Frequency;
  anchor_day: number;
  next_on: string;
  updated_at: string;
};

const COLUMNS = 'id, category_id, amount, note, frequency, anchor_day, next_on, updated_at';

export async function fetchRecurrences(): Promise<Recurrence[]> {
  const { data, error } = await supabase.from('expense_recurrences').select(COLUMNS).order('next_on', { ascending: true });
  if (error) throw error;
  return ((data ?? []) as RecurrenceRow[]).map((r) => ({
    id: r.id,
    categoryId: r.category_id,
    amount: Number(r.amount),
    note: r.note,
    frequency: r.frequency,
    anchorDay: r.anchor_day,
    nextOn: r.next_on,
    updatedAt: r.updated_at,
  }));
}

// `readUpdatedAt` null = overwrite after a conflict. Only later occurrences change: rows already written stay as they are.
export async function updateRecurrence(id: string, readUpdatedAt: string | null, input: RecurrenceInput): Promise<void> {
  let query = supabase
    .from('expense_recurrences')
    .update({
      category_id: input.categoryId,
      amount: input.amount,
      note: input.note,
      frequency: input.frequency,
      anchor_day: input.anchorDay,
      next_on: input.nextOn,
    })
    .eq('id', id);
  if (readUpdatedAt) query = query.eq('updated_at', readUpdatedAt);
  const { data, error } = await query.select('id');
  if (error) throw error;
  if (!data || data.length === 0) throw new ConflictError();
}

export async function deleteRecurrence(id: string): Promise<void> {
  const { error } = await supabase.from('expense_recurrences').delete().eq('id', id);
  if (error) throw error;
}
