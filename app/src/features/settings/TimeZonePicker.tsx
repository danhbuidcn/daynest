import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, TextInput, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { DialogShell } from '@/components/Dialog';
import { Icon } from '@/components/Icon';
import { searchTimeZones, timeZoneLabel } from '@/lib/timezones';
import { makeStyles, radius, space, useTheme } from '@/theme';

// F6 "Múi giờ": search box + fixed list, one row "Tên (GMT±h)", ✓ on the chosen one.
export function TimeZonePicker({
  visible,
  selected,
  onSelect,
  onClose,
}: {
  visible: boolean;
  selected: string;
  onSelect: (timeZone: string) => void;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'vi' ? 'vi' : 'en';
  const [query, setQuery] = useState('');
  const zones = useMemo(() => (visible ? searchTimeZones(query) : []), [visible, query]);

  const close = () => {
    setQuery('');
    onClose();
  };

  return (
    <DialogShell visible={visible} onClose={close} large boxStyle={styles.box}>
      <AppText variant="heading" style={styles.title}>
        {t('settings.timeZone')}
      </AppText>
      <View style={styles.search}>
        <Icon name="search" size={18} color={colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('settings.searchTimeZone')}
          placeholderTextColor={colors.textMuted}
          autoCorrect={false}
          style={styles.input}
        />
      </View>
      <FlatList
        data={zones}
        keyExtractor={(z) => z.id}
        keyboardShouldPersistTaps="handled"
        initialScrollIndex={query ? undefined : Math.max(0, zones.findIndex((z) => z.id === selected) - 2)}
        getItemLayout={(_, index) => ({ length: ROW, offset: ROW * index, index })}
        ListEmptyComponent={
          <AppText color={colors.textMuted} style={styles.empty}>
            {t('settings.noTimeZone')}
          </AppText>
        }
        renderItem={({ item }) => {
          const on = item.id === selected;
          return (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              onPress={() => {
                setQuery('');
                onSelect(item.id);
              }}
              style={[styles.option, on && styles.on]}>
              <AppText weight={on ? 'extrabold' : undefined} numberOfLines={1} style={styles.flex}>
                {timeZoneLabel(item.id, lang)}
              </AppText>
              {on ? <Icon name="check" size={22} color={colors.primary} /> : null}
            </Pressable>
          );
        }}
      />
    </DialogShell>
  );
}

const ROW = 52;

const useStyles = makeStyles(({ colors, type }) => ({
  box: { height: '85%', paddingHorizontal: space.md, paddingBottom: space.md },
  title: { textAlign: 'center', marginBottom: space.md },
  search: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.md,
    marginBottom: space.sm,
    borderRadius: radius.button,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  input: { flex: 1, ...type.body, color: colors.text, paddingVertical: 0 },
  option: { height: ROW, flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, borderRadius: radius.button },
  on: { backgroundColor: colors.primarySoft },
  flex: { flex: 1 },
  empty: { textAlign: 'center', marginTop: space.xl },
}));
