import { ActivityIndicator, Image, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';

import { fetchFeedPost } from '../api';
import { AppButton } from '../components/AppButton';
import { InstagramCard } from '../components/InstagramCard';
import { borderRadius, colors, spacing, typography } from '../design/tokens';
import type { FeedDetailScreenProps } from '../types';

function formatDateRange(openDate: string | null, closeDate: string | null): {
  label: string;
  isExpired: boolean;
} {
  if (!openDate && !closeDate) return { label: '기간 미정', isExpired: false };

  const fmt = (d: string) => {
    const date = new Date(d);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  const now = new Date();

  if (closeDate) {
    const close = new Date(closeDate);
    if (close < now) {
      const range = openDate ? `${fmt(openDate)} ~ ${fmt(closeDate)}` : `~ ${fmt(closeDate)}`;
      return { label: `${range} (마감)`, isExpired: true };
    }
  }

  const range = openDate
    ? `${fmt(openDate)} ~ ${closeDate ? fmt(closeDate) : '상시'}`
    : `~ ${closeDate ? fmt(closeDate) : '미정'}`;

  return { label: range, isExpired: false };
}

export function FeedDetailScreen({ route, navigation }: FeedDetailScreenProps) {
  const { feedId } = route.params;

  const { data: feed, isLoading, isError } = useQuery({
    queryKey: ['feed-post', feedId],
    queryFn: () => fetchFeedPost(feedId),
  });

  if (isLoading) {
    return (
      <SafeAreaView edges={['bottom', 'top']} style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !feed) {
    return (
      <SafeAreaView edges={['bottom', 'top']} style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>피드를 불러올 수 없습니다.</Text>
          <AppButton variant="secondary" onPress={() => navigation.goBack()}>
            뒤로 가기
          </AppButton>
        </View>
      </SafeAreaView>
    );
  }

  const isImage = feed.mediaType === 'IMAGE' || (!feed.mediaType && feed.mediaUrl);
  const isVideo = feed.mediaType === 'VIDEO';
  const dateInfo = formatDateRange(feed.openDate, feed.closeDate);

  return (
    <SafeAreaView edges={['bottom', 'top']} style={styles.safeArea}>
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Media Section ── */}
        {feed.mediaUrl ? (
          <View style={styles.mediaContainer}>
            {isImage ? (
              <Image
                source={{ uri: feed.mediaUrl }}
                style={styles.mediaImage}
                resizeMode="contain"
              />
            ) : null}
            {isVideo ? (
              <View style={styles.videoPlaceholder}>
                <Text style={styles.videoIcon}>▶</Text>
                <Text style={styles.videoLabel}>영상</Text>
              </View>
            ) : null}
            <View style={styles.mediaTypeBadge}>
              <Text style={styles.mediaTypeText}>
                {isVideo ? 'VIDEO' : 'IMAGE'}
              </Text>
            </View>
          </View>
        ) : null}

        {/* ── Content Card ── */}
        <View style={styles.contentSection}>
          <InstagramCard>
            {/* Account Name */}
            {feed.accountName ? (
              <Text style={styles.accountName}>
                @{feed.accountName}
              </Text>
            ) : null}

            {/* Caption */}
            {feed.caption ? (
              <Text style={styles.caption}>{feed.caption}</Text>
            ) : null}

            {/* Date Range */}
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>일정</Text>
              <View style={styles.dateValueRow}>
                <Text style={[styles.dateValue, dateInfo.isExpired && styles.dateExpired]}>
                  {dateInfo.label}
                </Text>
                {dateInfo.isExpired ? (
                  <View style={styles.expiredBadge}>
                    <Text style={styles.expiredBadgeText}>마감</Text>
                  </View>
                ) : null}
              </View>
            </View>

            {/* CTA Button */}
            {feed.linkUrl ? (
              <AppButton
                style={styles.ctaButton}
                variant="accent"
                onPress={() => {
                  const url = feed.linkUrl;
                  if (url) {
                    void Linking.openURL(url);
                  }
                }}
              >
                공구 보기
              </AppButton>
            ) : null}
          </InstagramCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: spacing['2xl'],
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: 16,
    marginBottom: spacing.lg,
  },
  scrollContent: { paddingBottom: spacing['4xl'] },
  /* ── Media ── */
  mediaContainer: {
    backgroundColor: '#000',
    position: 'relative',
    width: '100%',
  },
  mediaImage: {
    aspectRatio: 1,
    width: '100%',
  },
  videoPlaceholder: {
    alignItems: 'center',
    aspectRatio: 16 / 9,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
  },
  videoIcon: {
    color: '#fff',
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  videoLabel: {
    color: colors.textTertiary,
    fontSize: 14,
  },
  mediaTypeBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    position: 'absolute',
    right: spacing.sm,
    top: spacing.sm,
  },
  mediaTypeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  /* ── Content ── */
  contentSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  accountName: {
    ...typography.eyebrow,
    fontSize: 15,
    marginBottom: spacing.md,
  },
  caption: {
    ...typography.body,
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  dateRow: {
    borderTopColor: colors.divider,
    borderTopWidth: 1,
    flexDirection: 'row',
    paddingTop: spacing.md,
  },
  dateLabel: {
    ...typography.label,
    marginRight: spacing.md,
    width: 48,
  },
  dateValueRow: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
  },
  dateValue: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  dateExpired: {
    color: colors.error,
    textDecorationLine: 'line-through',
  },
  expiredBadge: {
    backgroundColor: colors.errorBg,
    borderRadius: borderRadius.full,
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  expiredBadgeText: {
    color: colors.error,
    fontSize: 11,
    fontWeight: '700',
  },
  ctaButton: {
    marginTop: spacing.lg,
  },
});
