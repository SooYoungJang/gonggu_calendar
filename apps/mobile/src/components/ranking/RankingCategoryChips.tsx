import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { SText } from '../ui/SText';

import { borderRadius, categoryColors, spacing } from '../../design/tokens';
import {
  RANKING_CATEGORY_LABELS,
  RANKING_SORT_CHIPS,
  type RankingCategory,
  type RankingSort,
} from '../../features/ranking/types';
import { useTheme } from '../../context/ThemeContext';
import type { ColorPalette } from '../../context/ThemeContext';

export interface RankingCategoryChipsProps {
  value: RankingCategory;
  categories: readonly RankingCategory[];
  sort: RankingSort;
  onChange: (next: RankingCategory) => void;
  onChangeSort: (next: RankingSort) => void;
}

function getCategoryPalette(colors: ColorPalette, category: RankingCategory) {
  if (category === 'all') {
    return { bg: colors.primaryBg, text: colors.primary, border: colors.primaryLight };
  }

  return categoryColors[category];
}

export function RankingCategoryChips({ value, categories, sort, onChange, onChangeSort }: RankingCategoryChipsProps) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={{ gap: spacing.sm }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipRow}>
        {categories.map((category) => {
          const selected = category === value;
          const palette = getCategoryPalette(colors, category);

          return (
            <Pressable
              key={category}
              accessibilityLabel={`${RANKING_CATEGORY_LABELS[category]} 카테고리`}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onChange(category)}
              style={[
                s.categoryChip,
                {
                  backgroundColor: selected ? palette.bg : colors.surface,
                  borderColor: selected ? palette.border : colors.border,
                },
              ]}
            >
              <SText variant="body" style={[{ fontWeight: '800', includeFontPadding: false }, { color: selected ? palette.text : colors.textSecondary }]}>
                {RANKING_CATEGORY_LABELS[category]}
              </SText>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.subChipRow}>
        {RANKING_SORT_CHIPS.map((chip) => {
          const selected = chip.key === sort;

          return (
            <Pressable
              key={chip.key}
              accessibilityLabel={`${chip.label} 정렬`}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onChangeSort(chip.key)}
              style={[s.sortChip, selected && s.selectedSortChip]}
            >
              <SText variant="caption" style={[{ fontWeight: '800', includeFontPadding: false, color: colors.textSecondary }, selected && { color: colors.textInverse }]}>{chip.label}</SText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function makeStyles(colors: ColorPalette) {
  return StyleSheet.create({
    categoryChip: {
      alignItems: 'center',
      borderRadius: borderRadius.full,
      borderWidth: 1,
      justifyContent: 'center',
      height: 36,
      paddingHorizontal: spacing.md,
      paddingVertical: 0,
    },
    chipRow: {
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
    },
    selectedSortChip: {
      backgroundColor: colors.textPrimary,
      borderColor: colors.textPrimary,
    },
    sortChip: {
      alignItems: 'center',
      borderColor: colors.border,
      borderRadius: borderRadius.full,
      borderWidth: 1,
      justifyContent: 'center',
      height: 32,
      paddingHorizontal: spacing.md,
      paddingVertical: 0,
    },
    subChipRow: {
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
    },
  });
}
