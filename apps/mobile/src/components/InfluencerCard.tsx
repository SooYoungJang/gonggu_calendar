import { Pressable, StyleSheet, View } from 'react-native';

import { SText } from './ui/SText';

import { borderRadius, colors, shadows, spacing } from '../design/tokens';
import type { Influencer } from '../types';

type InfluencerCardProps = {
  influencer: Influencer;
  onPress: () => void;
};

export function InfluencerCard({ influencer, onPress }: InfluencerCardProps) {
  const username = influencer.instagramUsername.replace(/^@/, '');
  const displayName = influencer.displayName?.trim() || '공동구매 인플루언서';
  const initials = username.slice(0, 2).toUpperCase();

  return (
    <Pressable
      testID={`influencer-card-${influencer.id}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.avatar}>
        <SText variant="cardBrand" style={{ color: colors.accent, fontWeight: '800' }}>{initials}</SText>
      </View>

      <View style={styles.info}>
        <SText variant="subtitle" style={{ color: colors.textPrimary, fontWeight: '800', marginBottom: spacing.xxs }} numberOfLines={1}>
          @{username}
        </SText>
        <SText variant="cardBrand" numberOfLines={1}>
          {displayName}
        </SText>
      </View>

      <View style={styles.ctaPill}>
        <SText variant="badge" style={{ fontSize: 11, fontWeight: '700' }}>공구 보기</SText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.995 }],
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.accentBg,
    borderRadius: borderRadius.full,
    height: 44,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 44,
  },
  info: {
    flex: 1,
  },
  ctaPill: {
    backgroundColor: colors.badgeBg,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
});
