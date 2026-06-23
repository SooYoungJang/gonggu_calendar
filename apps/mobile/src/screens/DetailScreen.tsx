import { useMemo } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '../components/AppButton';
import { InfoRow } from '../components/InfoRow';
import { InstagramCard } from '../components/InstagramCard';
import { ScreenHeader } from '../components/ScreenHeader';
import { borderRadius, spacing } from '../design/tokens';
import { useTheme } from '../context/ThemeContext';
import type { ColorPalette } from '../context/ThemeContext';
import type { DetailScreenProps } from '../types';
import { formatEndDate } from '../utils';

export function DetailScreen({ route }: DetailScreenProps) {
  const { groupBuy } = route.params;
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  return (
    <SafeAreaView edges={['bottom', 'top']} style={s.safeArea}>
      <View style={s.container}>
        <InstagramCard>
          <ScreenHeader
            eyebrow={`@${groupBuy.rawPost.influencer.instagramUsername}`}
            title={groupBuy.productName ?? '제품명 미확인'}
          />

          <InfoRow label="브랜드" value={groupBuy.brandName} />
          <InfoRow label="할인/혜택" value={groupBuy.discountInfo} />
          <InfoRow label="마감" value={formatEndDate(groupBuy.endDate)} />
          <InfoRow label="요약" value={groupBuy.summary} />

          <AppButton
            onPress={() => {
              const url = groupBuy.purchaseUrl ?? groupBuy.rawPost.postUrl;
              void Linking.openURL(url);
            }}
          >
            구매 링크 또는 원문 열기
          </AppButton>
        </InstagramCard>
      </View>
    </SafeAreaView>
  );
}

function makeStyles(colors: ColorPalette) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.bg },
    container: { flex: 1, paddingTop: spacing.lg },
  });
}
