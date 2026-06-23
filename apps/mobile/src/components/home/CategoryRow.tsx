import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SText } from '../../components/ui/SText';

import { borderRadius, categoryColors, spacing } from '../../design/tokens';
import type { CategoryColorName } from '../../design/tokens';

export type CategoryItem = {
  key: CategoryColorName;
  label: string;
  icon: string;
};

export const CATEGORIES: CategoryItem[] = [
  { key: 'beauty', label: '뷰티', icon: '✦' },
  { key: 'fashion', label: '패션', icon: '◒' },
  { key: 'food', label: '푸드', icon: '●' },
  { key: 'lifestyle', label: '라이프', icon: '◇' },
  { key: 'baby', label: '육아', icon: '♡' },
  { key: 'digital', label: '디지털', icon: '⌁' },
];

type CategoryIconProps = {
  item: CategoryItem;
  onPress: (category: CategoryColorName) => void;
};

function CategoryIcon({ item, onPress }: CategoryIconProps) {
  const token = categoryColors[item.key];
  return (
    <Pressable
      accessibilityLabel={`${item.label} 카테고리 보기`}
      accessibilityRole="button"
      onPress={() => onPress(item.key)}
      style={[styles.categoryItem, { backgroundColor: token.bg, borderColor: token.border }]}
    >
      <SText variant="body" style={[styles.categoryGlyph, { color: token.text }]}>{item.icon}</SText>
      <SText variant="caption" style={[styles.categoryLabel, { color: token.text }]}>{item.label}</SText>
    </Pressable>
  );
}

type CategoryRowProps = {
  onPressCategory: (category: CategoryColorName) => void;
};

export function CategoryRow({ onPressCategory }: CategoryRowProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
      {CATEGORIES.map((item) => (
        <CategoryIcon key={item.key} item={item} onPress={onPressCategory} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  categoryRow: { gap: spacing.sm, marginBottom: spacing.xl, paddingRight: spacing.lg },
  categoryItem: {
    alignItems: 'center',
    borderRadius: borderRadius.full,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  categoryGlyph: { fontWeight: '800' },
  categoryLabel: { fontWeight: '700' },
});
