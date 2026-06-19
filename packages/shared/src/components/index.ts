/**
 * @gonggu/shared — Cross-platform component contracts
 *
 * Shared TypeScript interfaces that bridge `packages/ui-web` and `apps/mobile`.
 *
 * Each file defines:
 * - Props contract (mandatory + optional props)
 * - State variants (disabled, loading, error, etc.)
 * - Accessibility attributes
 * - Platform-specific rendering notes
 *
 * Usage in web:
 *   import { ButtonProps } from "@gonggu/shared/components";
 *   // use in packages/ui-web/src/components/Button.tsx
 *
 * Usage in mobile:
 *   import { ButtonProps } from "@gonggu/shared/components";
 *   // use in apps/mobile/src/components/AppButton.tsx
 */
export * from "./shared-types";
export * from "./Button.types";
export * from "./Input.types";
export * from "./Card.types";
export * from "./Badge.types";
export * from "./Modal.types";
