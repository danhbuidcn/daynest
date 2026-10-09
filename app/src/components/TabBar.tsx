import Ionicons from '@expo/vector-icons/Ionicons';
import type { BottomTabBarProps } from 'expo-router/tabs';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/theme';
import { AppText } from './AppText';

type IconName = keyof typeof Ionicons.glyphMap;

const ICONS: Record<string, [IconName, IconName]> = {
  calendar: ['calendar-outline', 'calendar'],
  manage: ['book-outline', 'book'],
  stats: ['stats-chart-outline', 'stats-chart'],
  settings: ['settings-outline', 'settings'],
};

/** Thanh tab: 4 tab + nút `+` tròn nổi ở giữa. */
export function TabBar({ state, descriptors, navigation, onPlus }: BottomTabBarProps & { onPlus: () => void }) {
  const insets = useSafeAreaInsets();
  const items = state.routes.map((route, index) => {
    const focused = state.index === index;
    const { options } = descriptors[route.key];
    const [outline, filled] = ICONS[route.name] ?? ['ellipse-outline', 'ellipse'];
    const color = focused ? colors.primary : colors.textMuted;
    return (
      <Pressable
        key={route.key}
        accessibilityRole="tab"
        accessibilityState={{ selected: focused }}
        onPress={() => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        }}
        style={styles.tab}>
        <Ionicons name={focused ? filled : outline} size={24} color={color} />
        <AppText variant="caption" weight={focused ? 'extrabold' : undefined} color={color}>
          {options.title}
        </AppText>
      </Pressable>
    );
  });

  const plus = (
    <View key="plus" style={styles.tab}>
      <Pressable accessibilityRole="button" accessibilityLabel="Add" onPress={onPlus} style={styles.fab}>
        <Ionicons name="add" size={30} color={colors.white} />
      </Pressable>
    </View>
  );

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom, height: 64 + insets.bottom }]}>
      {[...items.slice(0, 2), plus, ...items.slice(2)]}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    shadowColor: colors.text,
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30,
    borderWidth: 4,
    borderColor: colors.bg,
    elevation: 6,
    shadowColor: colors.primary,
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
});
