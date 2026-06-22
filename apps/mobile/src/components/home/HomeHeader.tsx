import { Pressable, StyleSheet, View } from 'react-native';
import { SText } from '../ui/SText';

import { borderRadius, colors, shadows, spacing } from '../../design/tokens';

type HomeHeaderProps = {
  onOpenBookmarks: () => void;
  onOpenNotifications: () => void;
};

export function HomeHeader({ onOpenBookmarks, onOpenNotifications }: HomeHeaderProps) {
  return (
    <View style={styles.header}>
      <View>
        <SText variant="eyebrow">GongGu Alert</SText>
        <SText variant="title" style={{ fontWeight: '800' }}>공구캘린더</SText>
      </View>
      <View style={styles.headerActions}>
        <Pressable
          accessibilityLabel="북마크 열기"
          accessibilityRole="button"
          onPress={onOpenBookmarks}
          style={styles.iconButton}
        >
          <SText variant="cardTitle">⌑</SText>
        </Pressable>
        <Pressable
          accessibilityLabel="알림 열기"
          accessibilityRole="button"
          onPress={onOpenNotifications}
          style={styles.iconButton}
        >
          <SText variant="cardTitle">◔</SText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  headerActions: { flexDirection: 'row', gap: spacing.sm },
  iconButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 44,
    ...shadows.sm,
  },
});
