import { useMemo } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { SText } from '../../components/ui/SText';

import { borderRadius, spacing } from '../../design/tokens';
import type { FeedPost, GroupBuy } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import type { ColorPalette } from '../../context/ThemeContext';

type MonthlyBannerCarouselProps = {
  groupBuys: GroupBuy[];
  feedPosts?: FeedPost[];
  onPressDeal: (groupBuy: GroupBuy) => void;
};

function percentFor(item: GroupBuy) {
  const discount = item.discountInfo?.match(/(\d{1,3})\s*%/);
  if (discount?.[1]) return Math.min(Number(discount[1]), 99);
  return Math.max(40, Math.min(Math.round(item.confidence * 100), 99));
}

function visualFor(index: number, feedPosts: FeedPost[]) {
  const feed = feedPosts[index % Math.max(feedPosts.length, 1)];
  return feed?.ogImage ?? feed?.thumbnailUrl ?? feed?.mediaUrl ?? null;
}

function BannerCard({
  item,
  items,
  feedPosts,
  onPress,
  s,
  colors,
}: {
  item: GroupBuy;
  items: GroupBuy[];
  feedPosts: FeedPost[];
  onPress: () => void;
  s: ReturnType<typeof makeStyles>;
  colors: ColorPalette;
}) {
  const percent = percentFor(item);

  return (
    <Pressable
      accessibilityLabel={`${item.productName ?? '공구'} 배너 열기`}
      accessibilityRole="button"
      onPress={onPress}
      style={s.featureCard}
    >
      <View style={s.featureHeader}>
        <View style={s.featureTitleBlock}>
          <SText variant="cardTitle" numberOfLines={2} style={s.bannerTitle}>
            {item.productName ?? '새 공동구매'}
          </SText>
          <SText variant="cardBrand" numberOfLines={1} style={s.bannerMeta}>
            {item.brandName ?? `@${item.rawPost.influencer.instagramUsername}`} · {item.discountInfo ?? '혜택 확인'}
          </SText>
        </View>
        <View style={s.discountBadge}>
          <SText variant="label" style={s.discountText}>{percent}%</SText>
        </View>
      </View>

      <View style={s.progressRow}>
        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: `${percent}%` }]} />
        </View>
        <View style={s.progressBadge}>
          <SText variant="label" style={s.progressBadgeText}>{percent}%</SText>
        </View>
      </View>

      <View style={s.thumbnailRail}>
        {items.slice(0, 4).map((groupBuy, index) => {
          const visual = visualFor(index, feedPosts);
          return (
            <View key={groupBuy.id} style={s.bannerThumb}>
              {visual ? (
                <Image source={{ uri: visual }} style={s.bannerThumbImage} />
              ) : (
                <View style={[s.bannerThumbFallback, { backgroundColor: index % 2 === 0 ? colors.primaryBg : colors.surfaceHover }]}>
                  <SText variant="caption" style={s.bannerThumbText}>
                    {(groupBuy.brandName ?? groupBuy.productName ?? '공구').slice(0, 2)}
                  </SText>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </Pressable>
  );
}

export function MonthlyBannerCarousel({ groupBuys, feedPosts = [], onPressDeal }: MonthlyBannerCarouselProps) {
  const { colors, shadows } = useTheme();
  const s = useMemo(() => makeStyles(colors, shadows), [colors, shadows]);
  const featured = groupBuys[0];

  return (
    <View style={s.section}>
      <SText variant="cardTitle" style={s.sectionTitle}>이달의 공구</SText>
      {featured ? (
        <BannerCard
          item={featured}
          items={groupBuys}
          feedPosts={feedPosts}
          onPress={() => onPressDeal(featured)}
          s={s}
          colors={colors}
        />
      ) : (
        <View style={s.emptyCard}>
          <SText variant="body" style={s.emptyText}>이달의 공구를 준비 중입니다</SText>
        </View>
      )}
    </View>
  );
}

function makeStyles(colors: ColorPalette, shadows: Record<'sm' | 'md' | 'lg', any>) {
  return StyleSheet.create({
    section: { marginBottom: spacing.lg },
    sectionTitle: { color: colors.textPrimary, fontSize: 23, fontWeight: '900', marginBottom: spacing.md },
    featureCard: {
      backgroundColor: colors.bg,
      borderColor: colors.borderLight,
      borderRadius: borderRadius['3xl'],
      borderWidth: StyleSheet.hairlineWidth,
      minHeight: 236,
      padding: spacing.lg,
      ...shadows.md,
    },
    featureHeader: {
      alignItems: 'flex-start',
      flexDirection: 'row',
      gap: spacing.md,
      justifyContent: 'space-between',
    },
    featureTitleBlock: { flex: 1 },
    bannerTitle: { color: colors.textPrimary, fontSize: 21, fontWeight: '900', lineHeight: 29 },
    bannerMeta: { color: colors.textSecondary, fontSize: 14, fontWeight: '700', marginTop: spacing.xs },
    discountBadge: {
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: borderRadius.md,
      justifyContent: 'center',
      minHeight: 32,
      minWidth: 58,
      paddingHorizontal: spacing.sm,
    },
    discountText: { color: colors.textInverse, fontSize: 17, fontWeight: '900' },
    progressRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
    progressTrack: {
      backgroundColor: colors.borderLight,
      borderRadius: borderRadius.full,
      flex: 1,
      height: 10,
      overflow: 'hidden',
    },
    progressFill: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.full,
      height: '100%',
    },
    progressBadge: {
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: borderRadius.full,
      justifyContent: 'center',
      minHeight: 34,
      minWidth: 64,
      paddingHorizontal: spacing.sm,
    },
    progressBadgeText: { color: colors.textInverse, fontSize: 17, fontWeight: '900' },
    thumbnailRail: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.lg },
    bannerThumb: {
      borderRadius: borderRadius.md,
      flex: 1,
      height: 64,
      overflow: 'hidden',
    },
    bannerThumbImage: { height: '100%', resizeMode: 'cover', width: '100%' },
    bannerThumbFallback: { alignItems: 'center', flex: 1, justifyContent: 'center' },
    bannerThumbText: { color: colors.textSecondary, fontSize: 12, fontWeight: '800' },
    emptyCard: {
      alignItems: 'center',
      backgroundColor: colors.bg,
      borderRadius: borderRadius['3xl'],
      minHeight: 120,
      justifyContent: 'center',
      padding: spacing.lg,
    },
    emptyText: { color: colors.textSecondary },
  });
}
