import * as Crypto from 'expo-crypto';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Icon } from '@/components/Icon';
import { CHECKLIST_ITEM_MAX, CHECKLIST_MAX_ITEMS, type ChecklistItem } from '@/lib/notes';
import { colors, radius, space, type as typeScale } from '@/theme';

export function newChecklistItem(): ChecklistItem {
  return { id: Crypto.randomUUID(), text: '', done: false };
}

// Khối checklist (màn 17): ô tick vuông · chữ · ✕ · "+ Thêm mục". Enter on an item adds the next
// one below it. `focusId` = the item to focus once it is rendered (just added).
export function ChecklistBlock({
  items,
  onChange,
  focusId,
  onFocusHandled,
}: {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[], focusId?: string) => void;
  focusId: string | null;
  onFocusHandled: () => void;
}) {
  const { t } = useTranslation();
  const inputs = useRef(new Map<string, TextInput>());

  useEffect(() => {
    if (!focusId) return;
    inputs.current.get(focusId)?.focus();
    onFocusHandled();
  }, [focusId, items, onFocusHandled]);

  const update = (id: string, patch: Partial<ChecklistItem>) => onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const insertAfter = (index: number) => {
    if (items.length >= CHECKLIST_MAX_ITEMS) return;
    const item = newChecklistItem();
    onChange([...items.slice(0, index + 1), item, ...items.slice(index + 1)], item.id);
  };

  if (items.length === 0) return null;
  return (
    <View>
      {items.map((item, index) => (
        <View key={item.id} style={styles.row}>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: item.done }}
            hitSlop={10}
            onPress={() => update(item.id, { done: !item.done })}
            style={[styles.tick, item.done && styles.tickOn]}>
            {item.done ? <Icon name="check" size={14} color={colors.white} /> : null}
          </Pressable>
          <TextInput
            ref={(r) => {
              if (r) inputs.current.set(item.id, r);
              else inputs.current.delete(item.id);
            }}
            value={item.text}
            onChangeText={(text) => update(item.id, { text: text.replace(/\n/g, '') })}
            onSubmitEditing={() => insertAfter(index)}
            submitBehavior="submit"
            multiline
            maxLength={CHECKLIST_ITEM_MAX}
            placeholder={t('notes.itemPlaceholder')}
            placeholderTextColor={colors.textMuted}
            style={[styles.input, item.done && styles.done]}
          />
          <Pressable accessibilityRole="button" accessibilityLabel="Remove" hitSlop={10} onPress={() => onChange(items.filter((i) => i.id !== item.id))}>
            <Icon name="close" size={18} color={colors.textMuted} />
          </Pressable>
        </View>
      ))}
      {items.length < CHECKLIST_MAX_ITEMS ? (
        <Pressable accessibilityRole="button" onPress={() => insertAfter(items.length - 1)} style={styles.add}>
          <Icon name="plus" size={22} color={colors.primaryDark} />
          <AppText weight="bold" color={colors.primaryDark}>
            {t('notes.addItem')}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: space.md },
  tick: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  tickOn: { backgroundColor: colors.primary },
  input: { flex: 1, ...typeScale.body, color: colors.text, paddingVertical: space.sm, borderRadius: radius.icon },
  done: { textDecorationLine: 'line-through', color: colors.textMuted },
  add: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 10 },
});
