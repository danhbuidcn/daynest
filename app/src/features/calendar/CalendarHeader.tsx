import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Icon } from '@/components/Icon';
import { colors, radius, space } from '@/theme';

export function CalendarHeader({
  title,
  onPrev,
  onNext,
  onTitle,
  onToday,
}: {
  title: string;
  onPrev: () => void;
  onNext: () => void;
  onTitle: () => void;
  // Chi tiêu has no chip here: its "today" button sits in the period picker (S4 mockup 1b).
  onToday?: () => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.bar}>
      <Pressable accessibilityRole="button" accessibilityLabel={t('calendar.previous')} onPress={onPrev} hitSlop={8} style={styles.nav}>
        <Icon name="back" size={22} color={colors.text} />
      </Pressable>
      <Pressable accessibilityRole="button" onPress={onTitle} style={styles.titleWrap}>
        <AppText variant="title" numberOfLines={1} style={styles.title}>
          {title}
        </AppText>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={t('calendar.next')} onPress={onNext} hitSlop={8} style={styles.nav}>
        <Icon name="chevron" size={22} color={colors.text} />
      </Pressable>
      {onToday ? (
        <Pressable accessibilityRole="button" onPress={onToday} style={styles.today}>
          <AppText variant="caption" weight="extrabold" color={colors.primaryDark} numberOfLines={1}>
            {t('calendar.today')}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', gap: space.xs, paddingTop: 10, paddingRight: space.md, paddingBottom: 6, paddingLeft: space.sm },
  nav: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  titleWrap: { flex: 1 },
  title: { textAlign: 'center' },
  today: { height: 32, paddingHorizontal: space.md, borderRadius: radius.pill, backgroundColor: colors.primarySoft, justifyContent: 'center' },
});
