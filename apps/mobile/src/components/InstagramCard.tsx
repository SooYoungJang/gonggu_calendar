import { useMemo } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { borderRadius, spacing } from '../design/tokens';
import { useTheme } from '../context/ThemeContext';
import type { ColorPalette } from '../context/ThemeContext';

type InstagramCardProps = {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

export function InstagramCard({ children, onPress, style, contentStyle }: InstagramCardProps) {
  const { colors, shadows } = useTheme();
  const s = useMemo(() => makeStyles(colors, shadows), [colors, shadows]);

  const cardStyle = [s.card, style];

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [cardStyle, pressed && s.pressed]}>
        <View style={contentStyle}>{children}</View>
      </Pressable>
    );
  }

  return (
    <View style={cardStyle}>
      <View style={contentStyle}>{children}</View>
    </View>
  );
}

function makeStyles(colors: ColorPalette, shadows: Record<'sm' | 'md' | 'lg', any>) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      ...shadows.md,
    },
    pressed: {
      opacity: 0.86,
      transform: [{ scale: 0.995 }],
    },
  });
}
