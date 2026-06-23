import { useMemo } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { SText } from './ui/SText';
import { borderRadius, spacing, typography } from '../design/tokens';
import { useTheme } from '../context/ThemeContext';
import type { ColorPalette } from '../context/ThemeContext';

type SearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
};

export function SearchBar({ value, onChangeText, placeholder = '@username으로 인플루언서 검색', onClear }: SearchBarProps) {
  const { colors, shadows } = useTheme();
  const s = useMemo(() => makeStyles(colors, shadows), [colors, shadows]);

  return (
    <View style={s.container}>
      <View style={s.iconBubble}>
        <SText variant="body" style={s.iconText}>⌕</SText>
      </View>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        returnKeyType="search"
        style={s.input}
        testID="influencer-search-input"
        value={value}
        onChangeText={onChangeText}
      />
      {value.length > 0 ? (
        <Pressable
          accessibilityLabel="검색어 지우기"
          hitSlop={8}
          onPress={onClear ?? (() => onChangeText(''))}
          style={({ pressed }) => [s.clearButton, pressed && s.pressed]}
        >
          <SText variant="body" style={s.clearText}>×</SText>
        </Pressable>
      ) : null}
    </View>
  );
}

function makeStyles(colors: ColorPalette, shadows: Record<'sm' | 'md' | 'lg', any>) {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      flexDirection: 'row',
      marginBottom: spacing.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      ...shadows.sm,
    },
    iconBubble: {
      alignItems: 'center',
      backgroundColor: colors.primaryBg,
      borderRadius: borderRadius.full,
      height: 32,
      justifyContent: 'center',
      marginRight: spacing.sm,
      width: 32,
    },
    iconText: {
      color: colors.primary,
      fontSize: 20,
      fontWeight: '800',
      lineHeight: 22,
    },
    input: {
      ...typography.body,
      color: colors.textPrimary,
      flex: 1,
      minHeight: 40,
      paddingVertical: 0,
    },
    clearButton: {
      alignItems: 'center',
      backgroundColor: colors.surfaceHover,
      borderRadius: borderRadius.full,
      height: 28,
      justifyContent: 'center',
      marginLeft: spacing.sm,
      width: 28,
    },
    clearText: {
      color: colors.textSecondary,
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 22,
    },
    pressed: {
      opacity: 0.7,
    },
  });
}
