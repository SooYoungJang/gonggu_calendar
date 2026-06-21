import { Pressable, StyleSheet, Text, View } from 'react-native';

import { borderRadius, colors, spacing, typography } from '../../design/tokens';
import type { Influencer } from '../../types';

type SearchResultsPanelProps = {
  results: Influencer[];
  onPressInfluencer: (influencer: Influencer) => void;
};

export function SearchResultsPanel({ results, onPressInfluencer }: SearchResultsPanelProps) {
  return (
    <View style={styles.searchPanel}>
      <Text style={styles.searchPanelTitle}>검색 결과</Text>
      {results.length > 0 ? (
        results.map((influencer) => (
          <Pressable
            key={influencer.id}
            accessibilityLabel={`${influencer.instagramUsername} 인플루언서 보기`}
            accessibilityRole="button"
            onPress={() => onPressInfluencer(influencer)}
            style={styles.searchResultRow}
          >
            <Text style={styles.searchResultName}>{influencer.displayName ?? influencer.instagramUsername}</Text>
            <Text style={styles.searchResultMeta}>@{influencer.instagramUsername.replace(/^@/, '')}</Text>
          </Pressable>
        ))
      ) : (
        <View style={styles.emptySearchResult}>
          <Text style={styles.emptySearchTitle}>검색 결과가 없어요</Text>
          <Text style={styles.emptySearchText}>인스타그램 username 또는 브랜드명을 다시 확인해 주세요.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchPanel: { marginBottom: spacing.lg },
  searchPanelTitle: { ...typography.label, color: colors.textPrimary, marginBottom: spacing.sm },
  searchResultRow: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    marginBottom: spacing.sm,
    minHeight: 56,
    padding: spacing.md,
  },
  searchResultName: { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },
  searchResultMeta: { ...typography.caption, marginTop: spacing.xs },
  emptySearchResult: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    marginBottom: spacing.sm,
    padding: spacing.lg,
  },
  emptySearchTitle: { color: colors.textPrimary, fontSize: 14, fontWeight: '700', marginBottom: spacing.xs },
  emptySearchText: { ...typography.caption },
});
