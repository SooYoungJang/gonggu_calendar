import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { SText } from '../../components/ui/SText';
import { borderRadius, colors, spacing } from '../../design/tokens';

type WeeklyCalendarStripProps = {
  onPressCalendar: () => void;
};

function getWeekDays() {
  const labels = ['월', '화', '수', '목', '금', '토', '일'];
  const today = new Date();
  const current = today.getDay() === 0 ? 6 : today.getDay() - 1;
  const monday = new Date(today);
  monday.setDate(today.getDate() - current);

  return labels.map((label, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return { label, day: date.getDate(), selected: index === current };
  });
}

export function WeeklyCalendarStrip({ onPressCalendar }: WeeklyCalendarStripProps) {
  const weekDays = useMemo(() => getWeekDays(), []);
  return (
    <View style={styles.calendarSection}>
      <View style={styles.calendarTitleRow}>
        <SText variant="cardTitle">이번주 공구</SText>
        <Pressable
          accessibilityLabel="전체 캘린더 보기"
          accessibilityRole="button"
          onPress={onPressCalendar}
          style={styles.calendarViewAll}
        >
          <SText variant="cardBrand">전체보기</SText>
        </Pressable>
      </View>
      <View style={styles.calendarStrip}>
        {weekDays.map((day) => (
          <View key={`${day.label}-${day.day}`} style={styles.calendarDay}>
            <SText variant="caption">
              {day.label}
            </SText>
            <View style={[styles.calendarDateCircle, day.selected && styles.calendarDateCircleSelected]}>
              <SText variant="label">
                {day.day}
              </SText>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  calendarSection: { marginBottom: spacing.xl },
  calendarTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  calendarTitle: { color: colors.textPrimary, fontSize: 20, fontWeight: '800' },
  calendarViewAll: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'transparent',
    borderWidth: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.xs,
  },
  calendarViewAllText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  calendarStrip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
    padding: spacing.md,
  },
  calendarDay: { alignItems: 'center', minHeight: 58, minWidth: 38 },
  calendarWeekLabel: { color: colors.textTertiary, fontSize: 12, fontWeight: '700', marginBottom: spacing.xs },
  calendarWeekLabelSelected: { color: colors.ctaPurple },
  calendarDateCircle: {
    alignItems: 'center',
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    minHeight: 36,
    minWidth: 36,
  },
  calendarDateCircleSelected: { backgroundColor: colors.ctaPurple },
  calendarDateText: { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },
  calendarDateTextSelected: { color: colors.ctaPurpleText },
});
