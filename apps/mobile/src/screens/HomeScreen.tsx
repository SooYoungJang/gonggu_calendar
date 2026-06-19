import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';

import { fallbackGroupBuys, fetchGroupBuys, fetchInfluencers, searchInfluencers } from '../api';
import { AlertCard } from '../components/AlertCard';
import { AppButton } from '../components/AppButton';
import { InfluencerCard } from '../components/InfluencerCard';
import { ScreenHeader } from '../components/ScreenHeader';
import { SearchBar } from '../components/SearchBar';
import { borderRadius, colors, spacing, typography } from '../design/tokens';
import type { GroupBuy, HomeScreenProps, Influencer } from '../types';

function getFallbackInfluencers(groupBuys: GroupBuy[]): Influencer[] {
  const influencers = new Map<string, Influencer>();

  for (const groupBuy of groupBuys) {
    const username = groupBuy.rawPost.influencer.instagramUsername.replace(/^@/, '');
    const key = username.toLowerCase();

    if (!influencers.has(key)) {
      influencers.set(key, {
        id: `fallback-${key}`,
        instagramUsername: username,
        displayName: null,
        isActive: true,
      });
    }
  }

  return Array.from(influencers.values()).sort((a, b) => a.instagramUsername.localeCompare(b.instagramUsername));
}

export function HomeScreen({ navigation }: HomeScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: ['group-buys'],
    queryFn: fetchGroupBuys,
    retry: false,
  });

  const { data: influencersData } = useQuery({
    queryKey: ['influencers'],
    queryFn: fetchInfluencers,
    retry: false,
  });

  const groupBuys = data?.length ? data : fallbackGroupBuys;
  const influencers = influencersData?.length ? influencersData : getFallbackInfluencers(groupBuys);
  const searchResults = useMemo(() => searchInfluencers(influencers, searchQuery).slice(0, 5), [influencers, searchQuery]);
  const showSearchResults = searchQuery.trim().length > 0;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View className="flex-1 px-4 pt-2" style={styles.container}>
        <ScreenHeader
          eyebrow="GongGu Alert"
          title="공동구매 알림"
          subtitle="실시간 공동구매 알림"
        >
          <View style={styles.actionRow}>
            <AppButton onPress={() => navigation.navigate('Submit')} style={styles.headerActionButton}>
              공구 제보하기
            </AppButton>
            <AppButton onPress={() => navigation.navigate('Admin')} variant="secondary" style={styles.headerActionButton}>
              운영자 관리자 열기
            </AppButton>
          </View>
        </ScreenHeader>

        {isError ? (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>로컬 API가 꺼져 있어 샘플 데이터를 표시 중입니다.</Text>
          </View>
        ) : null}

        <SearchBar value={searchQuery} onChangeText={setSearchQuery} onClear={() => setSearchQuery('')} />

        {showSearchResults ? (
          <View style={styles.searchPanel}>
            <Text style={styles.searchPanelTitle}>인플루언서 검색 결과</Text>
            {searchResults.length > 0 ? (
              searchResults.map((influencer) => (
                <InfluencerCard
                  key={influencer.id}
                  influencer={influencer}
                  onPress={() => {
                    setSearchQuery('');
                    navigation.navigate('InfluencerGroupBuys', {
                      influencerUsername: influencer.instagramUsername,
                      influencerDisplayName: influencer.displayName,
                    });
                  }}
                />
              ))
            ) : (
              <View style={styles.emptySearchResult}>
                <Text style={styles.emptySearchTitle}>검색 결과가 없어요</Text>
                <Text style={styles.emptySearchText}>인스타그램 username을 다시 확인해 주세요.</Text>
              </View>
            )}
          </View>
        ) : null}

        <FlatList
          contentContainerStyle={styles.listContent}
          data={groupBuys}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={isFetching && !data ? <ActivityIndicator color={colors.primary} /> : null}
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
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  headerActionButton: { alignSelf: 'flex-start', marginTop: 0, paddingHorizontal: spacing.lg, paddingVertical: 10 },
  notice: { backgroundColor: colors.warningBg, borderRadius: borderRadius.sm, marginBottom: spacing.lg, padding: spacing.md },
  noticeText: { color: colors.noticeText, fontSize: 13, textAlign: 'center' },
  searchPanel: { marginBottom: spacing.md },
  searchPanelTitle: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptySearchResult: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    marginBottom: spacing.sm,
    padding: spacing.lg,
  },
  emptySearchTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  emptySearchText: {
    ...typography.caption,
  },
  listContent: { paddingBottom: spacing['2xl'] },
});
