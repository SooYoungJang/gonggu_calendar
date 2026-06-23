import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SText } from '../../components/ui/SText';

import { borderRadius, spacing, typography } from '../../design/tokens';
import type { Influencer } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import type { ColorPalette } from '../../context/ThemeContext';

type SearchResultsPanelProps = {
  results: Influencer[];
  onPressInfluencer: (influencer: Influencer) => void;
};

export function SearchResultsPanel({ results, onPressInfluencer }: SearchResultsPanelProps) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={s.searchPanel}>
      <SText variant="label" style={s.searchPanelTitle}>검색 결과</SText>
      {results.length > 0 ? (
        results.map((influencer) => (
          <Pressable
            key={influencer.id}
            accessibilityLabel={`${influencer.instagramUsername} 인플루언서 보기`}
            accessibilityRole="button"
            onPress={() => onPressInfluencer(influencer)}
            style={s.searchResultRow}
          >
            <SText variant="label" style={s.searchResultName}>{influencer.displayName ?? influencer.instagramUsername}</SText>
            <SText variant="caption" style={s.searchResultMeta}>@{influencer.instagramUsername.replace(/^@/, '')}</SText>
          </Pressable>
        ))
      ) : (
        <View style={s.emptySearchResult}>
          <SText variant="label" style={s.emptySearchTitle}>검색 결과가 없어요</SText>
          <SText variant="caption" style={s.emptySearchText}>인스타그램 username 또는 브랜드명을 다시 확인해 주세요.</SText>
        </View>
      )}
    </View>
  );
}

function makeStyles(colors: ColorPalette) {
  return StyleSheet.create({
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
}
