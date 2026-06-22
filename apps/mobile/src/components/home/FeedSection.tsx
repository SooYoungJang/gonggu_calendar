import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { SText } from '../../components/ui/SText';
import { borderRadius, colors, shadows, spacing, typography } from '../../design/tokens';
import type { FeedPost } from '../../types';

type FeedSectionProps = {
  feedPosts: FeedPost[];
  onPressFeed: (feedPost: FeedPost) => void;
  /** Loading state — shown when true and no feedPosts available */
  isLoading?: boolean;
  /** Error state — shown when true and no feedPosts available */
  isError?: boolean;
  /** Called when user taps retry after an error */
  onRetry?: () => void;
};

function FeedCard({ item, onPress }: { item: FeedPost; onPress: () => void }) {
  const ogImage = item.ogImage ?? item.thumbnailUrl;
  const title = item.ogTitle ?? item.caption ?? '';
  const description = item.ogDescription ?? '';
  const accountName = item.accountName ?? '알 수 없음';

  return (
    <Pressable
      accessibilityLabel={`${title || accountName} 피드 열기`}
      accessibilityRole="button"
      onPress={onPress}
      style={styles.card}
    >
      <View style={styles.thumbnailContainer}>
        {ogImage ? (
          <Image source={{ uri: ogImage }} style={styles.thumbnail} />
        ) : (
          <View style={styles.placeholder}>
            <SText variant="body" style={styles.placeholderIcon}>📷</SText>
          </View>
        )}
      </View>
      <View style={styles.cardBody}>
        <SText variant="cardBrand" numberOfLines={2} style={styles.caption}>
          {title}
        </SText>
        {description ? (
          <SText variant="caption" numberOfLines={2} style={styles.description}>
            {description}
          </SText>
        ) : null}
        <SText variant="caption" numberOfLines={1} style={styles.accountName}>
          {accountName}
        </SText>
      </View>
    </Pressable>
  );
}

export function FeedSection({ feedPosts, onPressFeed, isLoading, isError, onRetry }: FeedSectionProps) {
  // Loading state
  if (isLoading && feedPosts.length === 0) {
    return (
      <View style={styles.section}>
        <View style={styles.headerRow}>
          <SText variant="cardTitle" style={styles.sectionTitle}>피드</SText>
          <View style={styles.headerDot} />
        </View>
        <View style={styles.statusContainer}>
          <ActivityIndicator color={colors.primary} size="small" />
          <SText variant="body" style={styles.statusText}>피드를 불러오는 중...</SText>
        </View>
      </View>
    );
  }

  // Error state
  if (isError && feedPosts.length === 0) {
    return (
      <View style={styles.section}>
        <View style={styles.headerRow}>
          <SText variant="cardTitle" style={styles.sectionTitle}>피드</SText>
          <View style={styles.headerDot} />
        </View>
        <View style={styles.statusContainer}>
          <SText variant="body" style={styles.errorIcon}>⚠️</SText>
          <SText variant="body" style={styles.statusText}>피드를 불러올 수 없습니다.</SText>
          {onRetry ? (
            <Pressable
              accessibilityLabel="피드 다시 불러오기"
              accessibilityRole="button"
              onPress={onRetry}
              style={styles.retryButton}
            >
              <SText variant="label" style={styles.retryText}>다시 시도</SText>
            </Pressable>
          ) : null}
        </View>
      </View>
    );
  }

  // Empty state
  if (feedPosts.length === 0) {
    return (
      <View style={styles.section}>
        <View style={styles.headerRow}>
          <SText variant="cardTitle" style={styles.sectionTitle}>피드</SText>
          <View style={styles.headerDot} />
        </View>
        <View style={styles.statusContainer}>
          <SText variant="body" style={styles.statusText}>등록된 피드가 없습니다.</SText>
        </View>
      </View>
    );
  }

  // Normal state: horizontal scroll of feed cards
  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <SText variant="cardTitle" style={styles.sectionTitle}>피드</SText>
        <View style={styles.headerDot} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {feedPosts.map((item) => (
          <FeedCard key={item.id} item={item} onPress={() => onPressFeed(item)} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.xl,
    //
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
  },
  headerDot: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    height: 8,
    marginLeft: spacing.sm,
    width: 8,
  },
  scrollContent: {
    gap: spacing.md,
    paddingRight: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    width: 148,
  },
  thumbnailContainer: {
    backgroundColor: colors.primaryBg,
    height: 148,
    overflow: 'hidden',
  },
  thumbnail: {
    height: '100%',
    resizeMode: 'cover',
    width: '100%',
  },
  placeholder: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
  },
  placeholderIcon: {
    fontSize: 32,
  },
  cardBody: {
    padding: spacing.sm,
  },
  caption: {
    ...typography.cardBrand,
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    marginBottom: 2,
  },
  description: {
    ...typography.caption,
    color: colors.textTertiary,
    fontSize: 11,
    marginBottom: 2,
  },
  accountName: {
    ...typography.caption,
    color: colors.textTertiary,
    fontSize: 11,
  },
  statusContainer: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
    padding: spacing.xl,
  },
  statusText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  errorIcon: {
    fontSize: 28,
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
