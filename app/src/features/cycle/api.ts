import { supabase } from '@/lib/supabase';

export const PERIOD_LOAD_MONTHS = 12;

export async function fetchPeriodDays(fromIso: string): Promise<string[]> {
  const { data, error } = await supabase.from('period_days').select('day').gte('day', fromIso).order('day');
  if (error) throw error;
  return (data ?? []).map((row) => row.day as string);
}

// One save: drop the days that lost their tick, add the new ones (upsert, so a retry or a second device cannot clash).
export async function savePeriodDays(add: string[], remove: string[]): Promise<void> {
  if (remove.length > 0) {
    const { error } = await supabase.from('period_days').delete().in('day', remove);
    if (error) throw error;
  }
  if (add.length > 0) {
    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user.id;
    const { error } = await supabase
      .from('period_days')
      .upsert(
        add.map((day) => ({ user_id: userId, day })),
        { onConflict: 'user_id,day', ignoreDuplicates: true },
      );
    if (error) throw error;
  }
}
