import { useMemo } from 'react';
import { Text, type TextProps } from 'react-native';

import { typography } from '../../design/tokens';
import { useTheme } from '../../context/ThemeContext';
import type { ColorPalette } from '../../context/ThemeContext';

/**
 * SText variant names — maps to design system typography tokens.
 *
 * eyebrow    → typography.eyebrow    (12px/600/primary/0.5 letterSpacing)
 * title      → typography.title      (28px/700/textPrimary)
 * subtitle   → typography.subtitle   (15px/textSecondary/22 lineHeight)
 * cardTitle  → typography.cardTitle  (18px/700/textPrimary)
 * cardBrand  → typography.cardBrand  (13px/textSecondary)
 * cardSummary→ typography.cardSummary (13px/neutral[600]/20 lineHeight)
 * body       → typography.body       (14px/textSecondary/20 lineHeight)
 * caption    → typography.caption    (12px/textTertiary)
 * label      → typography.label      (14px/600/textSecondary)
 * badge      → typography.badge      (12px/600/badgeText)
 * button     → typography.button     (16px/600/textInverse)
 */
export type STextVariant =
  | 'eyebrow'
  | 'title'
  | 'subtitle'
  | 'cardTitle'
  | 'cardBrand'
  | 'cardSummary'
  | 'body'
  | 'caption'
  | 'label'
  | 'badge'
  | 'button';

/**
 * Build variant styles dynamically from the active theme palette.
 * Non-color properties are inherited from the static typography tokens.
 */
function makeVariantStyles(colors: ColorPalette): Record<STextVariant, object> {
  return {
    eyebrow: { ...typography.eyebrow, color: colors.primary },
    title: { ...typography.title, color: colors.textPrimary },
    subtitle: { ...typography.subtitle, color: colors.textSecondary },
    cardTitle: { ...typography.cardTitle, color: colors.textPrimary },
    cardBrand: { ...typography.cardBrand, color: colors.textSecondary },
    cardSummary: { ...typography.cardSummary },
    body: { ...typography.body, color: colors.textSecondary },
    caption: { ...typography.caption, color: colors.textTertiary },
    label: { ...typography.label, color: colors.textSecondary },
    badge: { ...typography.badge, color: colors.badgeText },
    button: { ...typography.button, color: colors.textInverse },
  };
}

export interface STextProps extends TextProps {
  /** Design system typography variant */
  variant: STextVariant;
}

/**
 * Design system text component.
 *
 * Wraps React Native `<Text>` with typography tokens from the design
 * system, selected via the `variant` prop. Colors are resolved from
 * the active theme so text automatically adapts to dark mode.
 * Custom `style` is merged *after* the variant style so it can
 * override token values.
 *
 * @example
 * ```tsx
 * <SText variant="title">Hello World</SText>
 * <SText variant="body" style={{ color: colors.textPrimary }}>
 *   Custom colored body
 * </SText>
 * ```
 */
export function SText({ variant, style, ...rest }: STextProps) {
  const { colors } = useTheme();
  const variantStyle = useMemo(() => makeVariantStyles(colors)[variant], [colors, variant]);
  return <Text style={[variantStyle, style]} {...rest} />;
}
