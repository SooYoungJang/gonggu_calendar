import { Text, type TextProps } from 'react-native';

import { typography } from '../../design/tokens';

/**
 * SText variant names — maps to design system typography tokens.
 *
 * eyebrow  → typography.eyebrow  (12px/600/primary/0.5 letterSpacing)
 * title    → typography.title    (28px/700/textPrimary)
 * cardTitle→ typography.cardTitle(18px/700/textPrimary)
 * body     → typography.body     (14px/textSecondary/20 lineHeight)
 * caption  → typography.caption  (12px/textTertiary)
 * label    → typography.label    (14px/600/textSecondary)
 * badge    → typography.badge    (12px/600/badgeText)
 */
export type STextVariant =
  | 'eyebrow'
  | 'title'
  | 'cardTitle'
  | 'body'
  | 'caption'
  | 'label'
  | 'badge';

/**
 * Maps a variant name to its typography token from the design system.
 */
const VARIANT_STYLES: Record<STextVariant, object> = {
  eyebrow: typography.eyebrow,
  title: typography.title,
  cardTitle: typography.cardTitle,
  body: typography.body,
  caption: typography.caption,
  label: typography.label,
  badge: typography.badge,
};

export interface STextProps extends TextProps {
  /** Design system typography variant */
  variant: STextVariant;
}

/**
 * Design system text component.
 *
 * Wraps React Native `<Text>` with typography tokens from the design
 * system, selected via the `variant` prop. Custom `style` is merged
 * *after* the variant style so it can override token values.
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
  return <Text style={[VARIANT_STYLES[variant], style]} {...rest} />;
}
