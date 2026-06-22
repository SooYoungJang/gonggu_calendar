import { Pressable, StyleSheet, View } from 'react-native';

import { SText } from '../../components/ui/SText';

import { borderRadius, colors, spacing } from '../../design/tokens';

type SubmitPromptProps = {
  onPressSubmit: () => void;
};

export function SubmitPrompt({ onPressSubmit }: SubmitPromptProps) {
  return (
    <View style={styles.submitPrompt}>
      <SText variant="cardTitle">놓치기 아까운 공구를 제보해 주세요</SText>
      <SText variant="cardSummary">승인된 제보만 캘린더와 알림에 표시돼요.</SText>
      <Pressable
        accessibilityLabel="공구 제보하기"
        accessibilityRole="button"
        onPress={onPressSubmit}
        style={styles.submitPromptButton}
      >
        <SText variant="label">공구 제보하기</SText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  submitPrompt: { backgroundColor: colors.ctaPurpleBg, borderRadius: 24, marginBottom: spacing.xl, padding: spacing.lg },
  submitPromptTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '800', marginBottom: spacing.xs },
  submitPromptText: { color: colors.textSecondary, fontSize: 13, lineHeight: 20, marginBottom: spacing.md },
  submitPromptButton: {
    alignItems: 'center',
    backgroundColor: colors.ctaPurple,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.lg,
  },
  submitPromptButtonText: { color: colors.ctaPurpleText, fontSize: 14, fontWeight: '800' },
});
