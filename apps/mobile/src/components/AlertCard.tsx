import { Pressable, StyleSheet, View } from 'react-native';
import { SText } from './ui/SText';

import { borderRadius, colors, shadows, spacing } from '../design/tokens';
import type { GroupBuy } from '../types';
import { formatEndDate } from '../utils';

type AlertCardProps = {
  item: GroupBuy;
  onPress: () => void;
};

export function AlertCard({ item, onPress }: AlertCardProps) {
  const brandLabel = item.brandName ?? '브랜드 미확인';
  const discountLabel = item.discountInfo ?? '혜택 확인 필요';
  const deadlineLabel = formatEndDate(item.endDate);
  const confidencePercent = Math.round(item.confidence * 100);
  const influencerUsername = item.rawPost.influencer.instagramUsername;

  return (
    <Pressable testID={`alert-card-${item.id}`} onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.brandBadge}>
        <SText variant="eyebrow" style={styles.brandBadgeEyebrow}>BRAND</SText>
        <SText variant="caption" style={styles.brandBadgeText} numberOfLines={2}>{brandLabel}</SText>
      </View>

      <View style={styles.info}>
        <View style={styles.topRow}>
          <SText variant="eyebrow" style={styles.influencerName} numberOfLines={1}>@{influencerUsername}</SText>
          <View style={styles.deadlinePill}>
            <SText variant="badge" style={styles.deadlineText}>{deadlineLabel}</SText>
          </View>
        </View>

        <SText variant="cardTitle" style={styles.productName} numberOfLines={1}>{item.productName ?? '제품명 미확인'}</SText>

        <View style={styles.discountRow}>
          <SText variant="cardBrand" style={styles.discount} numberOfLines={1}>{discountLabel}</SText>
          <View style={styles.confidenceBadge}>
            <SText variant="badge" style={styles.confidenceText}>신뢰도 {confidencePercent}%</SText>
          </View>
        </View>

        <SText variant="caption" style={styles.timeText} numberOfLines={1}>시간 정보 · {deadlineLabel}</SText>

        {item.summary ? <SText variant="caption" style={styles.summary} numberOfLines={2}>{item.summary}</SText> : null}
      </View>
    </Pressable>
  );
}

const BRAND_BADGE_SIZE = 76;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    marginBottom: spacing.md,
    padding: spacing.md,
    ...shadows.md,
  },
  pressed: { opacity: 0.86, transform: [{ scale: 0.995 }] },
  brandBadge: {
    width: BRAND_BADGE_SIZE,
    minHeight: BRAND_BADGE_SIZE,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    padding: spacing.sm,
  },
  brandBadgeEyebrow: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.8,
    marginBottom: spacing.xxs,
  },
  brandBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 16,
    textAlign: 'center',
  },
  info: { flex: 1 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  influencerName: { flex: 1, fontSize: 12, fontWeight: '700', color: colors.primary },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xxs,
  },
  discountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  discount: { flex: 1, fontSize: 13, fontWeight: '700', color: colors.accent },
  deadlinePill: {
    backgroundColor: colors.badgeBg,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  deadlineText: { color: colors.badgeText, fontSize: 11, fontWeight: '700' },
  confidenceBadge: {
    backgroundColor: colors.successBg,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  confidenceText: { color: colors.success, fontSize: 11, fontWeight: '700' },
  timeText: { fontSize: 11, color: colors.textTertiary, marginBottom: spacing.xs },
  summary: { fontSize: 12, color: colors.textTertiary, lineHeight: 17 },
});
