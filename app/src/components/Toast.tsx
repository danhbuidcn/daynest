import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, space } from '@/theme';
import { AppText } from './AppText';

type ToastKind = 'info' | 'error';
type ShowToast = (message: string, kind?: ToastKind) => void;

const ToastContext = createContext<ShowToast>(() => {});

const DURATION_MS = 2000;

/** Toast: viên thuốc nền `text`, hiện đáy màn (trên thanh tab), tự ẩn 2 giây. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<{ message: string; kind: ToastKind } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback<ShowToast>((message, kind = 'info') => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ message, kind });
    timer.current = setTimeout(() => setToast(null), DURATION_MS);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      {toast ? (
        <View pointerEvents="none" style={[styles.wrap, { bottom: insets.bottom + 96 }]}>
          <View style={styles.pill}>
            {toast.kind === 'error' ? <View style={styles.dot} /> : null}
            <AppText color={colors.white}>{toast.message}</AppText>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: colors.text,
    borderRadius: radius.pill,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.error },
});
