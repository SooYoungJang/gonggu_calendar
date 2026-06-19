import { Pressable, StyleSheet, Text, View } from 'react-native';

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
        <Text style={styles.avatarText}>{initials}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.username} numberOfLines={1}>
          @{username}
        </Text>
        <Text style={styles.displayName} numberOfLines={1}>
          {displayName}
        </Text>
      </View>

      <View style={styles.ctaPill}>
        <Text style={styles.ctaText}>공구 보기</Text>
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
  avatarText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '800',
  },
  info: {
    flex: 1,
  },
  username: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: spacing.xxs,
  },
  displayName: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  ctaPill: {
    backgroundColor: colors.badgeBg,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  ctaText: {
    color: colors.badgeText,
    fontSize: 11,
    fontWeight: '700',
  },
});
