import { ActivityIndicator, Image, Linking, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';

import { fetchFeedPost } from '../api';
import { AppButton } from '../components/AppButton';
import { InstagramCard } from '../components/InstagramCard';
import { SText } from '../components/ui/SText';
import { borderRadius, colors, spacing } from '../design/tokens';
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
          <SText variant="subtitle" style={{ fontSize: 16, marginBottom: spacing.lg }}>
            피드를 불러올 수 없습니다.
          </SText>
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
                <SText variant="body" style={{ fontSize: 48, color: '#fff', marginBottom: spacing.sm }}>▶</SText>
                <SText variant="caption" style={{ fontSize: 14 }}>영상</SText>
              </View>
            ) : null}
            <View style={styles.mediaTypeBadge}>
              <SText variant="caption" style={{ fontSize: 11, fontWeight: '700', color: '#fff', letterSpacing: 1 }}>
                {isVideo ? 'VIDEO' : 'IMAGE'}
              </SText>
            </View>
          </View>
        ) : null}

        {/* ── Content Card ── */}
        <View style={styles.contentSection}>
          <InstagramCard>
            {/* Account Name */}
            {feed.accountName ? (
              <SText variant="eyebrow" style={{ fontSize: 15, marginBottom: spacing.md }}>
                @{feed.accountName}
              </SText>
            ) : null}

            {/* Caption */}
            {feed.caption ? (
              <SText variant="body" style={{ color: colors.textPrimary, fontSize: 15, lineHeight: 24, marginBottom: spacing.lg }}>
                {feed.caption}
              </SText>
            ) : null}

            {/* Date Range */}
            <View style={styles.dateRow}>
              <SText variant="label" style={{ marginRight: spacing.md, width: 48 }}>일정</SText>
              <View style={styles.dateValueRow}>
                <SText variant="body" style={[{ fontSize: 14 }, dateInfo.isExpired && { color: colors.error, textDecorationLine: 'line-through' }]}>
                  {dateInfo.label}
                </SText>
                {dateInfo.isExpired ? (
                  <View style={styles.expiredBadge}>
                    <SText variant="caption" style={{ fontSize: 11, fontWeight: '700', color: colors.error }}>마감</SText>
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
  mediaTypeBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    position: 'absolute',
    right: spacing.sm,
    top: spacing.sm,
  },
  /* ── Content ── */
  contentSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  dateRow: {
    borderTopColor: colors.divider,
    borderTopWidth: 1,
    flexDirection: 'row',
    paddingTop: spacing.md,
  },
  dateValueRow: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
  },
  expiredBadge: {
    backgroundColor: colors.errorBg,
    borderRadius: borderRadius.full,
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  ctaButton: {
    marginTop: spacing.lg,
  },
});
