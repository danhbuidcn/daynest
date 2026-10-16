import type { TFunction } from 'i18next';

import type { IconName } from '@/components/Icon';
import type { AppColor } from '@/lib/colors';

export type Expense = {
  id: string;
  categoryId: string;
  amount: number;
  spentOn: string;
  note: string;
  updatedAt: string;
  // Set on expenses the app wrote from a recurring rule (null once the rule is deleted).
  recurrenceId: string | null;
};

export type ExpenseCategory = {
  id: string;
  // Built-in categories ('food', 'transport', 'bills') carry a key and no name (db.md).
  key: string | null;
  name: string | null;
  icon: string;
  color: AppColor;
};

// The 42 icons a user category can pick (mockup 21c, same order); stored by name.
export const PICKABLE_ICONS = [
  'tag', 'coffee', 'boba', 'beer', 'food', 'cart', 'bag', 'shirt', 'home', 'bolt', 'water', 'flame',
  'wifi', 'phone', 'tool', 'motorbike', 'fuel', 'bus', 'car', 'parking', 'plane', 'pill', 'hospital', 'scissors',
  'dumbbell', 'baby', 'paw', 'cap', 'bookopen', 'briefcase', 'laptop', 'card', 'coins', 'shield', 'gift', 'redpacket',
  'flower', 'film', 'game', 'music', 'trash', 'building',
] as const satisfies readonly IconName[];

// Icons dropped from the picker in S6 (and the built-in food / car / bill) still render on saved categories.
const LEGACY_ICONS: readonly IconName[] = ['wine', 'bike', 'heart', 'umbrella', 'ticket', 'camera', 'ball', 'tree', 'drop', 'bill'];
const CATEGORY_ICONS: readonly IconName[] = [...PICKABLE_ICONS, ...LEGACY_ICONS];

export function categoryIcon(c: ExpenseCategory | undefined): IconName {
  const icon = c?.icon as IconName | undefined;
  return icon && CATEGORY_ICONS.includes(icon) ? icon : 'tag';
}

export const USER_CATEGORY_MAX = 30;
export const CATEGORY_NAME_MAX = 30;

export function categoryName(t: TFunction, c: ExpenseCategory | undefined): string {
  if (!c) return '';
  return c.key ? t(`expenses.defaultCategories.${c.key}`) : (c.name ?? '');
}
