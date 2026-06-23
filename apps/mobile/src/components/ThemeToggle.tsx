import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { spacing, borderRadius } from '../design/tokens';
import { SText } from './ui/SText';
import { useTheme } from '../context/ThemeContext';
import type { ColorPalette } from '../context/ThemeContext';

/**
 * Dark mode toggle for settings/AdminScreen.
 * Shows current mode and allows switching between light/dark/system.
 */
export function ThemeToggle() {
  const { isDark, themeMode, colors, toggleTheme, setThemeMode } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={s.container}>
      <View style={s.header}>
        <SText variant="label">화면 모드</SText>
        <Pressable
          onPress={toggleTheme}
          style={[s.toggle, isDark ? s.toggleDark : s.toggleLight]}
          accessibilityRole="switch"
          accessibilityLabel={isDark ? '다크 모드 켜짐' : '다크 모드 꺼짐'}
        >
          <SText variant="label" style={s.toggleText}>
            {isDark ? '🌙 다크 모드' : '☀️ 라이트 모드'}
          </SText>
        </Pressable>
      </View>

      <View style={s.optionRow}>
        {(['system', 'light', 'dark'] as const).map((mode) => (
          <Pressable
            key={mode}
            onPress={() => setThemeMode(mode)}
            style={[
              s.option,
              themeMode === mode && s.optionActive,
            ]}
          >
            <SText
              variant="caption"
              style={[
                s.optionText,
                themeMode === mode && s.optionTextActive,
              ]}
            >
              {mode === 'system' ? '시스템' : mode === 'light' ? '라이트' : '다크'}
            </SText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function makeStyles(colors: ColorPalette) {
  return StyleSheet.create({
    container: {
      paddingVertical: spacing.md,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    toggle: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.md,
    },
    toggleLight: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    toggleDark: {
      backgroundColor: colors.primaryBg,
    },
    toggleText: {
      fontSize: 14,
    },
    optionRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    option: {
      flex: 1,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.surfaceHover,
      alignItems: 'center',
    },
    optionActive: {
      backgroundColor: colors.primary,
    },
    optionText: {
      fontWeight: '600',
    },
    optionTextActive: {
      color: colors.textInverse,
    },
  });
}
