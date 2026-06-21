import { Pressable, StyleSheet, Text, View } from 'react-native';

import { borderRadius, colors, shadows, spacing, typography } from '../../design/tokens';

type HomeHeaderProps = {
  onOpenBookmarks: () => void;
  onOpenNotifications: () => void;
};

export function HomeHeader({ onOpenBookmarks, onOpenNotifications }: HomeHeaderProps) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.headerEyebrow}>GongGu Alert</Text>
        <Text style={styles.appName}>공구캘린더</Text>
      </View>
      <View style={styles.headerActions}>
        <Pressable
          accessibilityLabel="북마크 열기"
          accessibilityRole="button"
          onPress={onOpenBookmarks}
          style={styles.iconButton}
        >
          <Text style={styles.iconButtonText}>⌑</Text>
        </Pressable>
        <Pressable
          accessibilityLabel="알림 열기"
          accessibilityRole="button"
          onPress={onOpenNotifications}
          style={styles.iconButton}
        >
          <Text style={styles.iconButtonText}>◔</Text>
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
  headerEyebrow: { ...typography.eyebrow, marginBottom: spacing.xs },
  appName: { color: colors.textPrimary, fontSize: 28, fontWeight: '800' },
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
  iconButtonText: { color: colors.textPrimary, fontSize: 18, fontWeight: '700' },
});
