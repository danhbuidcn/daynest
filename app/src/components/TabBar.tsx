import type { BottomTabBarProps } from 'expo-router/tabs';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { makeStyles, useTheme } from '@/theme';
import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

const ICONS: Record<string, IconName> = {
  calendar: 'calendar',
  manage: 'book',
  expenses: 'wallet',
  settings: 'gear',
};

export function TabBar({ state, descriptors, navigation, onPlus }: BottomTabBarProps & { onPlus: () => void }) {
  const { colors } = useTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const items = state.routes.map((route, index) => {
    const focused = state.index === index;
    const { options } = descriptors[route.key];
    const icon = ICONS[route.name] ?? 'calendar';
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
        <Icon name={icon} filled={focused} size={24} color={color} />
        <AppText variant="caption" weight={focused ? 'extrabold' : undefined} color={color}>
          {options.title}
        </AppText>
      </Pressable>
    );
  });

  const plus = (
    <View key="plus" style={styles.tab}>
      <Pressable accessibilityRole="button" accessibilityLabel="Add" onPress={onPlus} style={styles.fab}>
        <Icon name="plus" size={28} color={colors.white} />
      </Pressable>
    </View>
  );

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom, height: 64 + insets.bottom }]}>
      {[...items.slice(0, 2), plus, ...items.slice(2)]}
    </View>
  );
}

const useStyles = makeStyles(({ colors }) => ({
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
}));
