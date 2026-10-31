import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { spacing, useColors } from '@/theme';

type ScreenProps = {
  children: ReactNode;
  /** Tab screens already sit above the tab bar, so they skip the bottom edge. */
  edges?: Edge[];
};

export function Screen({ children, edges = ['top', 'bottom'] }: ScreenProps) {
  const colors = useColors();
  return (
    <SafeAreaView edges={edges} style={[styles.root, { backgroundColor: colors.background }]}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
});
