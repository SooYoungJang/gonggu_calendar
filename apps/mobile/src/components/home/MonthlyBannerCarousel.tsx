import { ImageBackground, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SText } from '../../components/ui/SText';

import { cardOverlayGradientStops, colors, shadows, spacing } from '../../design/tokens';
import type { GroupBuy } from '../../types';

type MonthlyBannerCarouselProps = {
  groupBuys: GroupBuy[];
  onPressDeal: (groupBuy: GroupBuy) => void;
};

function BannerCard({ item, onPress }: { item: GroupBuy; onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel={`${item.productName ?? '공구'} 배너 열기`}
      accessibilityRole="button"
      onPress={onPress}
      style={styles.bannerCard}
    >
      <ImageBackground
        source={{ uri: item.rawPost.postUrl }}
        style={styles.bannerImage}
        imageStyle={styles.bannerImageRadius}
      >
        <View style={styles.bannerOverlayTop} />
        <View style={styles.bannerOverlayBottom}>
          <SText variant="eyebrow" style={styles.bannerEyebrow}>이달의 공구</SText>
          <SText variant="cardTitle" style={styles.bannerTitle}>{item.productName ?? '새 공동구매'}</SText>
          <SText variant="cardBrand" style={styles.bannerMeta}>
            {item.brandName ?? `@${item.rawPost.influencer.instagramUsername}`} · {item.discountInfo ?? '혜택 확인'}
          </SText>
        </View>
      </ImageBackground>
    </Pressable>
  );
}

export function MonthlyBannerCarousel({ groupBuys, onPressDeal }: MonthlyBannerCarouselProps) {
  return (
    <View style={styles.section}>
      <SText variant="cardTitle" style={styles.sectionTitle}>이달의 공구</SText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bannerCarousel}>
        {groupBuys.slice(0, 4).map((item) => (
          <BannerCard key={item.id} item={item} onPress={() => onPressDeal(item)} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: spacing.xl },
  sectionTitle: { color: colors.textPrimary, fontSize: 20, fontWeight: '800', marginBottom: spacing.md },
  bannerCarousel: { gap: spacing.md, paddingRight: spacing.lg },
  bannerCard: { borderRadius: 28, minHeight: 176, minWidth: 292, overflow: 'hidden', ...shadows.md },
  bannerImage: { backgroundColor: colors.ctaPurpleBg, flex: 1, justifyContent: 'space-between', minHeight: 176 },
  bannerImageRadius: { borderRadius: 28 },
  bannerOverlayTop: { backgroundColor: cardOverlayGradientStops[0], flex: 1 },
  bannerOverlayBottom: { backgroundColor: cardOverlayGradientStops[2], padding: spacing.lg },
  bannerEyebrow: { color: colors.ctaPurpleText, fontSize: 12, fontWeight: '700', marginBottom: spacing.xs },
  bannerTitle: { color: colors.ctaPurpleText, fontSize: 22, fontWeight: '800', marginBottom: spacing.xs },
  bannerMeta: { color: colors.ctaPurpleText, fontSize: 13, fontWeight: '600' },
});
