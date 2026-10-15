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
