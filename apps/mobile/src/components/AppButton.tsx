import { useMemo } from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { SText } from './ui/SText';
import { borderRadius, spacing } from '../design/tokens';
import { useTheme } from '../context/ThemeContext';
import type { ColorPalette } from '../context/ThemeContext';

type ButtonVariant = 'primary' | 'secondary' | 'accent';

type AppButtonProps = {
  children: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: ButtonVariant;
  style?: StyleProp<ViewStyle>;
};

export function AppButton({
  children,
  onPress,
  disabled = false,
  variant = 'primary',
  style,
}: AppButtonProps) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.base,
        s[variant],
        disabled && s.disabled,
        pressed && !disabled && s.pressed,
        style,
      ]}
    >
      <SText variant="button" style={[s.text, variant === 'secondary' && s.secondaryText]}>
        {children}
      </SText>
    </Pressable>
  );
}

function makeStyles(colors: ColorPalette) {
  return StyleSheet.create({
    base: {
      alignItems: 'center',
      borderRadius: borderRadius.lg,
      paddingHorizontal: spacing.lg,
      paddingVertical: 14,
    },
    primary: {
      backgroundColor: colors.primary,
    },
    accent: {
      backgroundColor: colors.accent,
    },
    secondary: {
      backgroundColor: colors.borderLight,
    },
    text: {
      color: colors.textInverse,
      fontSize: 16,
      fontWeight: '600',
    },
    secondaryText: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    disabled: {
      opacity: 0.55,
    },
    pressed: {
      opacity: 0.82,
    },
  });
}
