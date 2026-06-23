import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { SText } from './ui/SText';
import { spacing } from '../design/tokens';
import { useTheme } from '../context/ThemeContext';
import type { ColorPalette } from '../context/ThemeContext';

export function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  if (!value) return null;
  return (
    <View style={s.infoRow}>
      <SText variant="label" style={s.infoLabel}>{label}</SText>
      <SText variant="body" style={s.infoValue}>{value}</SText>
    </View>
  );
}

function makeStyles(colors: ColorPalette) {
  return StyleSheet.create({
    infoRow: {
      borderBottomColor: colors.border,
      borderBottomWidth: 1,
      flexDirection: 'row',
      marginBottom: spacing.md,
      paddingBottom: spacing.md,
    },
    infoLabel: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: '600',
      width: 80,
    },
    infoValue: {
      color: colors.textPrimary,
      flex: 1,
      fontSize: 14,
      lineHeight: 20,
    },
  });
}
