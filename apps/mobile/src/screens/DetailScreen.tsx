import { useMemo } from 'react';
import { Alert, Linking, Share, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '../components/AppButton';
import { InfoRow } from '../components/InfoRow';
import { InstagramCard } from '../components/InstagramCard';
import { ScreenHeader } from '../components/ScreenHeader';
import { SText } from '../components/ui/SText';
import { borderRadius, spacing } from '../design/tokens';
import { useTheme } from '../context/ThemeContext';
import type { ColorPalette } from '../context/ThemeContext';
import type { DetailScreenProps } from '../types';
import { formatEndDate, getDaysRemaining } from '../utils';

export function DetailScreen({ route }: DetailScreenProps) {
  const { groupBuy } = route.params;
  const { colors, shadows } = useTheme();
  const s = useMemo(() => makeStyles(colors, shadows), [colors, shadows]);

  const deadlineLabel = formatEndDate(groupBuy.endDate);
  const daysRemaining = getDaysRemaining(groupBuy.endDate);
  const isExpired = daysRemaining < 0;
  const isUrgent = daysRemaining >= 0 && daysRemaining <= 3;

  const handleShare = async () => {
    const productName = groupBuy.productName ?? '공동구매';
    const username = groupBuy.rawPost.influencer.instagramUsername;
    try {
      await Share.share({
        message: `${productName} (@${username})\n${groupBuy.purchaseUrl ?? groupBuy.rawPost.postUrl}`,
      });
    } catch {
      Alert.alert('오류', '공유에 실패했습니다.');
    }
  };

  const handleOpenLink = () => {
    const url = groupBuy.purchaseUrl ?? groupBuy.rawPost.postUrl;
    void Linking.openURL(url);
  };

  return (
    <SafeAreaView edges={['bottom', 'top']} style={s.safeArea}>
      <View style={s.container}>
        {/* Deadline badge */}
        {(groupBuy.endDate) && (
          <View style={[
            s.deadlineBadge,
            isExpired && s.deadlineExpired,
            isUrgent && !isExpired && s.deadlineUrgent,
          ]}>
            <SText variant="caption" style={s.deadlineText}>
              {isExpired ? '⏰ ' : isUrgent ? '🔥 ' : '📅 '}
              {deadlineLabel}
            </SText>
          </View>
        )}

        <InstagramCard>
          <ScreenHeader
            eyebrow={`@${groupBuy.rawPost.influencer.instagramUsername}`}
            title={groupBuy.productName ?? '제품명 미확인'}
          />

          {/* Discount highlight */}
          {groupBuy.discountInfo ? (
            <View style={s.discountHighlight}>
              <SText variant="cardTitle" style={s.discountText}>
                {groupBuy.discountInfo}
              </SText>
            </View>
          ) : null}

          {/* Info rows */}
          <InfoRow label="브랜드" value={groupBuy.brandName} />
          <InfoRow label="할인/혜택" value={groupBuy.discountInfo} />
          <InfoRow label="마감" value={deadlineLabel} />
          <InfoRow label="요약" value={groupBuy.summary} />

          {/* Action buttons */}
          <View style={s.actionArea}>
            <AppButton onPress={handleOpenLink} disabled={isExpired}>
              {isExpired ? '마감된 공구' : '구매 링크 열기'}
            </AppButton>
            <AppButton variant="secondary" onPress={handleShare}>
              공유하기
            </AppButton>
          </View>
        </InstagramCard>

        {/* Original post link */}
        <View style={s.postLinkSection}>
          <SText variant="caption" style={s.postLinkLabel}>원문 보기</SText>
          <SText variant="body" style={s.postLinkUrl} numberOfLines={1}>
            {groupBuy.rawPost.postUrl}
          </SText>
          <AppButton variant="secondary" onPress={handleOpenLink}>
            인스타그램에서 보기
          </AppButton>
        </View>
      </View>
    </SafeAreaView>
  );
}

function makeStyles(colors: ColorPalette, shadows: Record<'sm' | 'md' | 'lg', any>) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.bg },
    container: {
      flex: 1,
      paddingTop: spacing.lg,
      paddingHorizontal: spacing.lg,
    },
    deadlineBadge: {
      alignSelf: 'flex-start',
      backgroundColor: colors.primaryBg,
      borderRadius: borderRadius.full,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      marginBottom: spacing.md,
    },
    deadlineUrgent: {
      backgroundColor: colors.errorBg,
    },
    deadlineExpired: {
      backgroundColor: colors.surfaceHover,
    },
    deadlineText: {
      fontWeight: '700',
      color: colors.primary,
    },
    discountHighlight: {
      backgroundColor: colors.primaryBg,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      marginBottom: spacing.lg,
    },
    discountText: {
      color: colors.primary,
      fontWeight: '800',
    },
    actionArea: {
      gap: spacing.sm,
      marginTop: spacing.lg,
    },
    postLinkSection: {
      alignItems: 'center',
      gap: spacing.xs,
      marginTop: spacing.md,
    },
    postLinkLabel: {
      color: colors.textTertiary,
    },
    postLinkUrl: {
      color: colors.textSecondary,
      fontSize: 12,
      maxWidth: 280,
    },
  });
}
