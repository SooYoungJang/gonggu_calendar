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
        <SText variant="title" style={s.title}>공구캘린더</SText>
        <SText variant="eyebrow" style={s.kicker}>GongGu Alert</SText>
      </View>
      <View style={s.headerActions}>
        <Pressable
          accessibilityLabel="북마크 열기"
          accessibilityRole="button"
          onPress={onOpenBookmarks}
          style={s.bookmarkButton}
        >
          <SText variant="cardTitle" style={s.bookmarkIcon}>⌑</SText>
        </Pressable>
        <Pressable
          accessibilityLabel="알림 열기"
          accessibilityRole="button"
          onPress={onOpenNotifications}
          style={s.bellButton}
        >
          <SText variant="cardTitle" style={s.bellIcon}>🔔</SText>
          <View style={s.notificationDot} />
        </Pressable>
      </View>
    </View>
  );
}

function makeStyles(colors: ColorPalette, shadows: Record<'sm' | 'md' | 'lg', any>) {
  return StyleSheet.create({
    header: {
      alignItems: 'flex-start',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing['2xl'],
    },
    title: {
      color: colors.textPrimary,
      fontSize: 34,
      fontWeight: '900',
      lineHeight: 40,
    },
    kicker: {
      color: colors.primary,
      fontSize: 18,
      fontWeight: '800',
      lineHeight: 24,
      marginTop: spacing.xs,
    },
    headerActions: { alignItems: 'center', flexDirection: 'row', gap: spacing.xs, paddingTop: spacing.xs },
    bookmarkButton: {
      alignItems: 'center',
      backgroundColor: colors.bg,
      borderColor: colors.borderLight,
      borderRadius: borderRadius.full,
      borderWidth: 1,
      justifyContent: 'center',
      minHeight: 44,
      minWidth: 44,
      ...shadows.sm,
    },
    bookmarkIcon: { color: colors.textSecondary, fontSize: 20, fontWeight: '800' },
    bellButton: {
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 52,
      minWidth: 52,
      position: 'relative',
    },
    bellIcon: {
      fontSize: 34,
      lineHeight: 40,
    },
    notificationDot: {
      backgroundColor: colors.primary,
      borderColor: colors.surface,
      borderRadius: borderRadius.full,
      borderWidth: 2,
      height: 13,
      position: 'absolute',
      right: 5,
      top: 8,
      width: 13,
    },
  });
}
