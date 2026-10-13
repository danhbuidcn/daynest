import type { ReactNode } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, View } from 'react-native';
import { NestableScrollContainer } from 'react-native-draggable-flatlist';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, space } from '@/theme';
import { ScreenHeader } from './ScreenHeader';

export function FormScreen({
  title,
  onBack,
  closeIcon,
  footer,
  nestable,
  onPressTitle,
  titleHint,
  children,
}: {
  title: string;
  onBack: () => void;
  closeIcon?: boolean;
  footer: ReactNode;
  // A draggable list inside (ChecklistBlock) needs its scroll parent to be nestable.
  nestable?: boolean;
  onPressTitle?: () => void;
  titleHint?: string;
  children: ReactNode;
}) {
  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      <ScreenHeader title={title} onBack={onBack} closeIcon={closeIcon} onPressTitle={onPressTitle} titleHint={titleHint} />
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        {nestable ? (
          <NestableScrollContainer style={styles.flex} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            {children}
          </NestableScrollContainer>
        ) : (
          <ScrollView style={styles.flex} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        )}
        <View style={styles.footer}>{footer}</View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  content: { paddingHorizontal: space.lg, paddingTop: space.sm, paddingBottom: space.xl, gap: space.lg },
  footer: { paddingHorizontal: space.lg, paddingTop: space.sm, paddingBottom: space.lg, backgroundColor: colors.bg },
});
