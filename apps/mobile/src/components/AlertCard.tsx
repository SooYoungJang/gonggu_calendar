import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SText } from './ui/SText';

import { borderRadius, spacing } from '../design/tokens';
import type { GroupBuy } from '../types';
import { formatEndDate } from '../utils';
import { useTheme } from '../context/ThemeContext';
import type { ColorPalette } from '../context/ThemeContext';

type AlertCardProps = {
  item: GroupBuy;
  onPress: () => void;
};

export function AlertCard({ item, onPress }: AlertCardProps) {
  const { colors, shadows } = useTheme();
  const s = useMemo(() => makeStyles(colors, shadows), [colors, shadows]);

  const brandLabel = item.brandName ?? '브랜드 미확인';
  const discountLabel = item.discountInfo ?? '혜택 확인 필요';
  const deadlineLabel = formatEndDate(item.endDate);
  const confidencePercent = Math.round(item.confidence * 100);
  const influencerUsername = item.rawPost.influencer.instagramUsername;

  return (
    <Pressable testID={`alert-card-${item.id}`} onPress={onPress} style={({ pressed }) => [s.card, pressed && s.pressed]}>
      <View style={s.brandBadge}>
        <SText variant="eyebrow" style={s.brandBadgeEyebrow}>BRAND</SText>
        <SText variant="caption" style={s.brandBadgeText} numberOfLines={2}>{brandLabel}</SText>
      </View>

      <View style={s.info}>
        <View style={s.topRow}>
          <SText variant="eyebrow" style={s.influencerName} numberOfLines={1}>@{influencerUsername}</SText>
          <View style={s.deadlinePill}>
            <SText variant="badge" style={s.deadlineText}>{deadlineLabel}</SText>
          </View>
        </View>

        <SText variant="cardTitle" style={s.productName} numberOfLines={1}>{item.productName ?? '제품명 미확인'}</SText>

        <View style={s.discountRow}>
          <SText variant="cardBrand" style={s.discount} numberOfLines={1}>{discountLabel}</SText>
          <View style={s.confidenceBadge}>
            <SText variant="badge" style={s.confidenceText}>신뢰도 {confidencePercent}%</SText>
          </View>
        </View>

        <SText variant="caption" style={s.timeText} numberOfLines={1}>시간 정보 · {deadlineLabel}</SText>

        {item.summary ? <SText variant="caption" style={s.summary} numberOfLines={2}>{item.summary}</SText> : null}
      </View>
    </Pressable>
  );
}

const BRAND_BADGE_SIZE = 76;

function makeStyles(colors: ColorPalette, shadows: Record<'sm' | 'md' | 'lg', any>) {
  return StyleSheet.create({
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
}
