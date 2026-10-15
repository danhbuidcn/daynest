import type { IconName } from '@/components/Icon';
import type { NamedColor } from '@/lib/colors';

export type SuggestedCategory = { key: string; icon: IconName; color: NamedColor };

// Names live in i18n (`expenses.suggested.<key>`), so a suggestion is added in the app's language.
export const SUGGESTED_CATEGORIES: readonly SuggestedCategory[] = [
  { key: 'groceries', icon: 'cart', color: 'mint' },
  { key: 'boba', icon: 'boba', color: 'pink' },
  { key: 'drinks', icon: 'beer', color: 'lemon' },
  { key: 'rent', icon: 'home', color: 'sky' },
  { key: 'electricity', icon: 'bolt', color: 'lemon' },
  { key: 'water', icon: 'water', color: 'sky' },
  { key: 'internet', icon: 'wifi', color: 'lavender' },
  { key: 'phone', icon: 'phone', color: 'mint' },
  { key: 'fuel', icon: 'fuel', color: 'peach' },
  { key: 'parking', icon: 'parking', color: 'sky' },
  { key: 'repair', icon: 'tool', color: 'lemon' },
  { key: 'tuition', icon: 'cap', color: 'lavender' },
  { key: 'health', icon: 'hospital', color: 'mint' },
  { key: 'medicine', icon: 'pill', color: 'pink' },
  { key: 'beauty', icon: 'scissors', color: 'pink' },
  { key: 'clothes', icon: 'shirt', color: 'lavender' },
  { key: 'ceremony', icon: 'flower', color: 'lemon' },
  { key: 'luckyMoney', icon: 'redpacket', color: 'peach' },
  { key: 'gifts', icon: 'gift', color: 'pink' },
  { key: 'entertainment', icon: 'film', color: 'lavender' },
  { key: 'travel', icon: 'plane', color: 'sky' },
  { key: 'pets', icon: 'paw', color: 'peach' },
  { key: 'insurance', icon: 'shield', color: 'mint' },
  { key: 'installments', icon: 'card', color: 'sky' },
];

// Hides a suggestion whose name the user already has (case-insensitive).
export function visibleSuggestions<T extends { name: string }>(suggestions: readonly T[], existingNames: readonly (string | null)[]): T[] {
  const taken = new Set(existingNames.map((n) => n?.trim().toLowerCase()));
  return suggestions.filter((s) => !taken.has(s.name.trim().toLowerCase()));
}
