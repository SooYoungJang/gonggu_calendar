import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';

import { fallbackGroupBuys, fetchGroupBuysByInfluencer } from '../api';
import { AlertCard } from '../components/AlertCard';
import { AppButton } from '../components/AppButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { borderRadius, colors, spacing, typography } from '../design/tokens';
import type { GroupBuy, InfluencerGroupBuysScreenProps } from '../types';

function getFallbackGroupBuysByInfluencer(username: string): GroupBuy[] {
  const normalizedUsername = username.replace(/^@/, '').toLowerCase();
  return fallbackGroupBuys.filter(
    (item) => item.rawPost.influencer.instagramUsername.replace(/^@/, '').toLowerCase() === normalizedUsername,
  );
}

export function InfluencerGroupBuysScreen({ navigation, route }: InfluencerGroupBuysScreenProps) {
  const { influencerUsername, influencerDisplayName } = route.params;
  const normalizedUsername = influencerUsername.replace(/^@/, '');

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: ['group-buys', 'influencer', normalizedUsername],
    queryFn: () => fetchGroupBuysByInfluencer(normalizedUsername),
    retry: false,
  });

  const groupBuys = data ?? getFallbackGroupBuysByInfluencer(normalizedUsername);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View className="flex-1 px-4 pt-2" style={styles.container}>
        <ScreenHeader
          eyebrow="Influencer GongGu"
          title={`@${normalizedUsername}`}
          subtitle={influencerDisplayName ? `${influencerDisplayName}의 공동구매 목록` : '인플루언서 공동구매 목록'}
        >
          <AppButton onPress={() => navigation.goBack()} variant="secondary" style={styles.backButton}>
            검색으로 돌아가기
          </AppButton>
        </ScreenHeader>

        {isError ? (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>로컬 API가 꺼져 있어 샘플 데이터를 표시 중입니다.</Text>
          </View>
        ) : null}

        <FlatList
          contentContainerStyle={styles.listContent}
          data={groupBuys}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            isFetching ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>아직 표시할 공구가 없어요</Text>
                <Text style={styles.emptyText}>이 인플루언서의 승인된 공동구매가 등록되면 여기에서 확인할 수 있습니다.</Text>
              </View>
            )
          }
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={colors.primary} />}
          renderItem={({ item }) => (
            <AlertCard item={item} onPress={() => navigation.navigate('Detail', { groupBuy: item })} />
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1 },
  backButton: { alignSelf: 'flex-start', marginTop: 0, paddingHorizontal: spacing.lg, paddingVertical: 10 },
  notice: { backgroundColor: colors.warningBg, borderRadius: borderRadius.sm, marginBottom: spacing.lg, padding: spacing.md },
  noticeText: { color: '#92400e', fontSize: 13, textAlign: 'center' },
  listContent: { flexGrow: 1, paddingBottom: spacing['2xl'] },
  emptyState: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    marginTop: spacing.md,
    padding: spacing['2xl'],
  },
  emptyTitle: {
    ...typography.cardTitle,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  emptyText: {
    ...typography.body,
    textAlign: 'center',
  },
});
