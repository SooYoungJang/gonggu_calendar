import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { SText } from './ui/SText';

import { borderRadius, spacing } from '../design/tokens';
import type { Influencer } from '../types';
import { useTheme } from '../context/ThemeContext';
import type { ColorPalette } from '../context/ThemeContext';

type InfluencerCardProps = {
  influencer: Influencer;
  onPress: () => void;
};

export function InfluencerCard({ influencer, onPress }: InfluencerCardProps) {
  const { colors, shadows } = useTheme();
  const s = useMemo(() => makeStyles(colors, shadows), [colors, shadows]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${influencer.displayName ?? influencer.instagramUsername} 선택`}
      onPress={onPress}
      style={({ pressed }) => [s.card, pressed && s.pressed]}
    >
      <View style={s.avatar}>
        <SText variant="cardTitle" style={s.avatarText}>
          {(influencer.displayName ?? influencer.instagramUsername).slice(0, 2).toUpperCase()}
        </SText>
      </View>
      <View style={s.info}>
        <SText variant="cardTitle" style={s.displayName} numberOfLines={1}>
          {influencer.displayName ?? `@${influencer.instagramUsername}`}
        </SText>
        <SText variant="caption" style={s.username}>@{influencer.instagramUsername}</SText>
      </View>
    </Pressable>
  );
}

function makeStyles(colors: ColorPalette, shadows: Record<'sm' | 'md' | 'lg', any>) {
  return StyleSheet.create({
    card: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      flexDirection: 'row',
      marginBottom: spacing.sm,
      padding: spacing.md,
      ...shadows.sm,
    },
    pressed: { opacity: 0.82 },
    avatar: {
      alignItems: 'center',
      backgroundColor: colors.primaryBg,
      borderRadius: borderRadius.full,
      height: 44,
      justifyContent: 'center',
      marginRight: spacing.md,
      width: 44,
    },
    avatarText: { color: colors.primary, fontSize: 18, fontWeight: '800' },
    info: { flex: 1 },
    displayName: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
    username: { fontSize: 12, fontWeight: '600' },
  });
}
