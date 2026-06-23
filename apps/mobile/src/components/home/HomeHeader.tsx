import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SText } from '../ui/SText';

import { borderRadius, spacing } from '../../design/tokens';
import { useTheme } from '../../context/ThemeContext';
import type { ColorPalette } from '../../context/ThemeContext';

type HomeHeaderProps = {
  onOpenBookmarks: () => void;
  onOpenNotifications: () => void;
};

export function HomeHeader({ onOpenBookmarks, onOpenNotifications }: HomeHeaderProps) {
  const { colors, shadows } = useTheme();
  const s = useMemo(() => makeStyles(colors, shadows), [colors, shadows]);

  return (
    <View style={s.header}>
      <View>
        <SText variant="eyebrow">GongGu Alert</SText>
        <SText variant="title" style={{ fontWeight: '800' }}>공구캘린더</SText>
      </View>
      <View style={s.headerActions}>
        <Pressable
          accessibilityLabel="북마크 열기"
          accessibilityRole="button"
          onPress={onOpenBookmarks}
          style={s.iconButton}
        >
          <SText variant="cardTitle">⌑</SText>
        </Pressable>
        <Pressable
          accessibilityLabel="알림 열기"
          accessibilityRole="button"
          onPress={onOpenNotifications}
          style={s.iconButton}
        >
          <SText variant="cardTitle">◔</SText>
        </Pressable>
      </View>
    </View>
  );
}

function makeStyles(colors: ColorPalette, shadows: Record<'sm' | 'md' | 'lg', any>) {
  return StyleSheet.create({
    header: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.lg,
    },
    headerActions: { flexDirection: 'row', gap: spacing.sm },
    iconButton: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: borderRadius.full,
      borderWidth: 1,
      justifyContent: 'center',
      minHeight: 44,
      minWidth: 44,
      ...shadows.sm,
    },
  });
}
