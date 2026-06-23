import { useMemo } from 'react';
import { Pressable, StyleSheet, type GestureResponderEvent } from 'react-native';

import { SText } from '../ui/SText';
import { borderRadius, rankingColors, spacing } from '../../design/tokens';
import { useTheme } from '../../context/ThemeContext';
import type { ColorPalette } from '../../context/ThemeContext';

export interface FollowButtonProps {
  isFollowing: boolean;
  sellerName: string;
  onFollow?: () => void;
  onPress?: () => void;
}

export function FollowButton({ isFollowing, sellerName, onFollow, onPress }: FollowButtonProps) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const palette = isFollowing ? rankingColors.following.active : rankingColors.following.inactive;
  const handlePress = (event: GestureResponderEvent) => {
    event.stopPropagation();
    onFollow?.();
    onPress?.();
  };

  return (
    <Pressable
      accessibilityLabel={`${sellerName} ${isFollowing ? '팔로잉 해제' : '팔로우'}`}
      accessibilityRole="button"
      onPress={handlePress}
      style={({ pressed }) => [
        s.button,
        {
          backgroundColor: palette.bg,
          borderColor: isFollowing ? palette.bg : colors.border,
          opacity: pressed ? 0.72 : 1,
        },
      ]}
    >
      <SText variant="badge" style={[s.text, { color: palette.text }]}>{isFollowing ? '팔로잉' : '팔로우'}</SText>
    </Pressable>
  );
}

function makeStyles(colors: ColorPalette) {
  return StyleSheet.create({
    button: {
      alignItems: 'center',
      borderRadius: borderRadius.full,
      borderWidth: 1,
      justifyContent: 'center',
      minHeight: 36,
      minWidth: 62,
      paddingHorizontal: spacing.sm,
    },
    text: {
      fontSize: 12,
      fontWeight: '800',
    },
  });
}
