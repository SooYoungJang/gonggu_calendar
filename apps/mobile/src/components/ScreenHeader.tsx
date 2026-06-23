import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { SText } from './ui/SText';
import { spacing } from '../design/tokens';
import { useTheme } from '../context/ThemeContext';
import type { ColorPalette } from '../context/ThemeContext';

type ScreenHeaderProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children?: React.ReactNode;
};

export function ScreenHeader({ eyebrow, title, subtitle, right, children }: ScreenHeaderProps) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={s.header}>
      <View style={s.topRow}>
        <View style={s.titleBlock}>
          <SText variant="eyebrow">{eyebrow}</SText>
          <SText variant="title">{title}</SText>
        </View>
        {right ? <View style={s.right}>{right}</View> : null}
      </View>
      {subtitle ? <SText variant="subtitle" style={s.subtitle}>{subtitle}</SText> : null}
      {children}
    </View>
  );
}

function makeStyles(colors: ColorPalette) {
  return StyleSheet.create({
    header: {
      marginBottom: spacing['2xl'],
    },
    topRow: {
      alignItems: 'flex-start',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    titleBlock: {
      flex: 1,
    },
    right: {
      marginLeft: spacing.md,
    },
    subtitle: {
      lineHeight: 22,
    },
  });
}
