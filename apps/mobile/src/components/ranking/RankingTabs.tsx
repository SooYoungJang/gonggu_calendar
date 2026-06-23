import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { SText } from '../ui/SText';

import { borderRadius, spacing } from '../../design/tokens';
import type { RankingTab } from '../../features/ranking/types';
import { useTheme } from '../../context/ThemeContext';
import type { ColorPalette } from '../../context/ThemeContext';

export interface RankingTabsProps {
  value: RankingTab;
  rankingCount?: number;
  followingCount?: number;
  onChange: (next: RankingTab) => void;
}

const TABS: readonly { key: RankingTab; label: string; countKey: 'rankingCount' | 'followingCount' }[] = [
  { key: 'ranking', label: '랭킹', countKey: 'rankingCount' },
  { key: 'following', label: '팔로잉 셀러', countKey: 'followingCount' },
] as const;

export function RankingTabs({ value, rankingCount, followingCount, onChange }: RankingTabsProps) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const counts = { rankingCount, followingCount };

  return (
    <View style={s.container} accessibilityRole="tablist">
      {TABS.map((tab) => {
        const selected = tab.key === value;
        const count = counts[tab.countKey];

        return (
          <Pressable
            key={tab.key}
            accessibilityLabel={`${tab.label} 탭`}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(tab.key)}
            style={[s.tab, selected && s.selectedTab]}
          >
            <SText variant="label" style={[{ fontWeight: '800' }, selected && { color: colors.primary }]}>
              {tab.label}
              {typeof count === 'number' ? ` ${count}` : ''}
            </SText>
          </Pressable>
        );
      })}
    </View>
  );
}

function makeStyles(colors: ColorPalette) {
  return StyleSheet.create({
    container: {
      backgroundColor: colors.surfaceHover,
      borderRadius: borderRadius.full,
      flexDirection: 'row',
      gap: spacing.xs,
      padding: spacing.xs,
    },
    tab: {
      alignItems: 'center',
      borderRadius: borderRadius.full,
      flex: 1,
      justifyContent: 'center',
      minHeight: 42,
      paddingHorizontal: spacing.md,
    },
    selectedTab: {
      backgroundColor: colors.surface,
    },
  });
}
