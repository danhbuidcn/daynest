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
};

export type ExpenseCategory = {
  id: string;
  // Built-in categories ('food', 'transport', 'bills') carry a key and no name (db.md).
  key: string | null;
  name: string | null;
  icon: string;
  color: AppColor;
};

// Grows to the 36 category icons in step 6; a name the app doesn't know yet shows `tag` (db.md).
const CATEGORY_ICONS: readonly IconName[] = ['food', 'car', 'bill', 'tag'];

export function categoryIcon(c: ExpenseCategory | undefined): IconName {
  const icon = c?.icon as IconName | undefined;
  return icon && CATEGORY_ICONS.includes(icon) ? icon : 'tag';
}

export function categoryName(t: TFunction, c: ExpenseCategory | undefined): string {
  if (!c) return '';
  return c.key ? t(`expenses.defaultCategories.${c.key}`) : (c.name ?? '');
}

// Form default: the category used last on this device, else "Ăn uống", else the first one.
export function defaultCategoryId(categories: readonly ExpenseCategory[], lastUsed: string | null): string | undefined {
  return (categories.find((c) => c.id === lastUsed) ?? categories.find((c) => c.key === 'food') ?? categories[0])?.id;
}
