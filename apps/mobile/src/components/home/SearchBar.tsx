import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { SText } from '../../components/ui/SText';
import { borderRadius, colors, shadows, spacing } from '../../design/tokens';

type SearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
  onClear: () => void;
};

export function SearchBar({ value, onChangeText, onClear }: SearchBarProps) {
  return (
    <View style={styles.searchBar}>
      <SText variant="body" style={styles.searchIcon}>⌕</SText>
      <TextInput
        accessibilityLabel="공구 검색"
        placeholder="브랜드명, 제품명으로 검색해보세요"
        placeholderTextColor={colors.textTertiary}
        value={value}
        onChangeText={onChangeText}
        style={styles.searchInput}
      />
      {value ? (
        <Pressable
          accessibilityLabel="검색어 지우기"
          accessibilityRole="button"
          onPress={onClear}
          style={styles.clearButton}
        >
          <SText variant="body" style={styles.clearButtonText}>×</SText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: spacing.lg,
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    ...shadows.sm,
  },
  searchIcon: { color: colors.textSecondary, fontSize: 18, marginRight: spacing.sm },
  searchInput: { color: colors.textPrimary, flex: 1, fontSize: 15, minHeight: 44 },
  clearButton: { alignItems: 'center', justifyContent: 'center', minHeight: 44, minWidth: 44 },
  clearButtonText: { color: colors.textSecondary, fontSize: 22 },
});
