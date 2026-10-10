import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, space } from '@/theme';
import { AppText } from './AppText';

type ToastKind = 'info' | 'error';
// Optional button on the right, e.g. "Hoàn tác" after moving a note to the trash (F5).
type ToastAction = { label: string; onPress: () => void };
type ShowToast = (message: string, kind?: ToastKind, action?: ToastAction) => void;

const ToastContext = createContext<ShowToast>(() => {});

const DURATION_MS = 2000;
const ACTION_DURATION_MS = 4000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<{ message: string; kind: ToastKind; action?: ToastAction } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback<ShowToast>((message, kind = 'info', action) => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ message, kind, action });
    timer.current = setTimeout(() => setToast(null), action ? ACTION_DURATION_MS : DURATION_MS);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      {toast ? (
        <View pointerEvents="box-none" style={[styles.wrap, { bottom: insets.bottom + 96 }]}>
          <View style={styles.pill}>
            {toast.kind === 'error' ? <View style={styles.dot} /> : null}
            <AppText color={colors.white} numberOfLines={2} style={styles.message}>
              {toast.message}
            </AppText>
            {toast.action ? (
              <Pressable
                accessibilityRole="button"
                hitSlop={12}
                onPress={() => {
                  toast.action?.onPress();
                  setToast(null);
                }}>
                <AppText weight="extrabold" color={colors.primary}>
                  {toast.action.label}
                </AppText>
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  pill: {
    maxWidth: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: colors.text,
    borderRadius: radius.pill,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  message: { flexShrink: 1 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.error },
});
