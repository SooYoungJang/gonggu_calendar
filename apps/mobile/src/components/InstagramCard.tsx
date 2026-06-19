import type { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, borderRadius, spacing, shadows } from '../design/tokens';

type InstagramCardProps = PropsWithChildren<{
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}>;

export function InstagramCard({ children, onPress, style, contentStyle }: InstagramCardProps) {
  const cardStyle = [styles.card, style];

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [cardStyle, pressed && styles.pressed]}>
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

const styles = StyleSheet.create({
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
