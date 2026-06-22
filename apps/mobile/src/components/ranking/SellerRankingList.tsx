import { FlatList, StyleSheet, View } from 'react-native';

import { SText } from '../ui/SText';

import { colors, spacing } from '../../design/tokens';
import type { RankingLoadState, RankingThumbnail, SellerRanking } from '../../features/ranking/types';
import { SellerRankingRow } from './SellerRankingRow';

export interface SellerRankingListProps {
  state: RankingLoadState;
  bottomPadding: number;
  onRefresh?: () => void;
  onPressItem?: (item: SellerRanking) => void;
  onPressThumbnail?: (thumbnail: RankingThumbnail, item: SellerRanking) => void;
  onToggleFollow?: (item: SellerRanking) => void;
}

function RowSeparator() {
  return <View style={styles.separator} />;
}

export function SellerRankingList({
  state,
  bottomPadding,
  onRefresh,
  onPressItem,
  onPressThumbnail,
  onToggleFollow,
}: SellerRankingListProps) {
  if (state.status === 'loading' && !state.data) {
    return (
      <View style={styles.statusContainer}>
        <SText variant="body" style={{ fontWeight: '700', textAlign: 'center' }}>랭킹을 불러오는 중…</SText>
      </View>
    );
  }

  if (state.status === 'error') {
    return (
      <View style={styles.statusContainer}>
        <SText variant="body" style={{ color: colors.error, fontWeight: '700', textAlign: 'center' }}>{state.message}</SText>
        {state.retry ? (
          <SText
            accessible
            variant="label"
            accessibilityLabel="다시 불러오기"
            onPress={state.retry}
            style={{ color: colors.primary, fontWeight: '800', marginTop: spacing.sm }}
          >
            다시 시도
          </SText>
        ) : null}
      </View>
    );
  }

  if (state.status === 'empty') {
    return (
      <View style={styles.statusContainer}>
        <SText variant="body" style={{ fontWeight: '700', textAlign: 'center' }}>{state.message}</SText>
        {state.action ? (
          <SText
            accessible
            variant="label"
            accessibilityLabel={state.action.label}
            onPress={state.action.onPress}
            style={[{ color: colors.primary, fontWeight: '800', marginTop: spacing.sm }]}
          >
            {state.action.label}
          </SText>
        ) : null}
      </View>
    );
  }

  return (
    <FlatList
      accessibilityLabel="셀러 랭킹 목록"
      accessibilityRole="list"
      data={state.data}
      ItemSeparatorComponent={RowSeparator}
      keyExtractor={(item) => item.id}
      ListFooterComponent={<View style={{ height: bottomPadding }} />}
      onRefresh={onRefresh}
      progressViewOffset={spacing.lg}
      refreshing={'refreshing' in state ? !!state.refreshing : false}
      scrollIndicatorInsets={{ bottom: bottomPadding }}
      renderItem={({ item }) => (
        <SellerRankingRow
          item={item}
          onPress={onPressItem ?? (() => {})}
          onPressThumbnail={onPressThumbnail}
          onToggleFollow={onToggleFollow ?? (() => {})}
        />
      )}
      style={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    backgroundColor: colors.bg,
  },
  separator: {
    height: spacing.sm,
  },
  statusContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
  },
});
