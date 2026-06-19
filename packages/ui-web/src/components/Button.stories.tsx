import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Button, PrimaryButton, SecondaryButton, GhostButton, DestructiveButton, OutlineButton } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A versatile button component with multiple variants, sizes, and states. Built with accessibility in mind including focus-visible styles, loading states, and proper ARIA attributes.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "ghost", "destructive", "outline"],
      description: "Visual style variant",
      table: { category: "Appearance" },
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Button size",
      table: { category: "Appearance" },
    },
    loading: {
      control: "boolean",
      description: "Shows loading spinner and disables button",
      table: { category: "State" },
    },
    disabled: {
      control: "boolean",
      description: "Disables the button",
      table: { category: "State" },
    },
    fullWidth: {
      control: "boolean",
      description: "Makes button full width",
      table: { category: "Layout" },
    },
    leftIcon: {
      control: false,
      description: "Icon to display on the left",
      table: { category: "Content" },
    },
    rightIcon: {
      control: false,
      description: "Icon to display on the right",
      table: { category: "Content" },
    },
    onClick: { action: "clicked" },
  },
  decorators: [
    (Story) => (
      <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg min-w-[320px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// Basic Variants
// ============================================================================

export const Primary: Story = {
  args: {
    variant: "primary",
    children: "Primary Button",
    onClick: fn(),
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary Button",
    onClick: fn(),
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
    children: "Ghost Button",
    onClick: fn(),
  },
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "Destructive Button",
    onClick: fn(),
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
    children: "Outline Button",
    onClick: fn(),
  },
};

// ============================================================================
// Sizes
// ============================================================================

export const Small: Story = {
  args: {
    size: "sm",
    children: "Small Button",
    onClick: fn(),
  },
};

export const Medium: Story = {
  args: {
    size: "md",
    children: "Medium Button",
    onClick: fn(),
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    children: "Large Button",
    onClick: fn(),
  },
};

// ============================================================================
// States
// ============================================================================

export const Loading: Story = {
  args: {
    loading: true,
    children: "Loading...",
    onClick: fn(),
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: "Disabled Button",
    onClick: fn(),
  },
};

export const LoadingSecondary: Story = {
  args: {
    variant: "secondary",
    loading: true,
    children: "Saving...",
    onClick: fn(),
  },
};

// ============================================================================
// With Icons
// ============================================================================

export const WithLeftIcon: Story = {
  args: {
    leftIcon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 5v14M19 12H5" />
      </svg>
    ),
    children: "Add Item",
    onClick: fn(),
  },
};

export const WithRightIcon: Story = {
  args: {
    rightIcon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    ),
    children: "Continue",
    onClick: fn(),
  },
};

export const IconOnly: Story = {
  args: {
    size: "md",
    leftIcon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    children: "",
    onClick: fn(),
  },
};

// ============================================================================
// Full Width
// ============================================================================

export const FullWidth: Story = {
  args: {
    fullWidth: true,
    children: "Full Width Button",
    onClick: fn(),
  },
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
};

// ============================================================================
// All Variants Gallery
// ============================================================================

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button variant="primary" onClick={fn()}>Primary</Button>
      <Button variant="secondary" onClick={fn()}>Secondary</Button>
      <Button variant="ghost" onClick={fn()}>Ghost</Button>
      <Button variant="outline" onClick={fn()}>Outline</Button>
      <Button variant="destructive" onClick={fn()}>Destructive</Button>
    </div>
  ),
};

// ============================================================================
// All Sizes Gallery
// ============================================================================

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button size="sm" onClick={fn()}>Small</Button>
      <Button size="md" onClick={fn()}>Medium</Button>
      <Button size="lg" onClick={fn()}>Large</Button>
    </div>
  ),
};

// ============================================================================
// Interactive States Demo
// ============================================================================

export const InteractiveStates: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
          Default
        </h4>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" onClick={fn()}>Primary</Button>
          <Button variant="secondary" onClick={fn()}>Secondary</Button>
          <Button variant="ghost" onClick={fn()}>Ghost</Button>
          <Button variant="outline" onClick={fn()}>Outline</Button>
          <Button variant="destructive" onClick={fn()}>Destructive</Button>
        </div>
      </div>
      <div>
        <h4 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
          Hover (mouse over)
        </h4>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" onClick={fn()}>Primary</Button>
          <Button variant="secondary" onClick={fn()}>Secondary</Button>
          <Button variant="ghost" onClick={fn()}>Ghost</Button>
          <Button variant="outline" onClick={fn()}>Outline</Button>
          <Button variant="destructive" onClick={fn()}>Destructive</Button>
        </div>
      </div>
      <div>
        <h4 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
          Active (click and hold)
        </h4>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" onClick={fn()}>Primary</Button>
          <Button variant="secondary" onClick={fn()}>Secondary</Button>
          <Button variant="ghost" onClick={fn()}>Ghost</Button>
          <Button variant="outline" onClick={fn()}>Outline</Button>
          <Button variant="destructive" onClick={fn()}>Destructive</Button>
        </div>
      </div>
      <div>
        <h4 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
          Focus (Tab to focus)
        </h4>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" onClick={fn()}>Primary</Button>
          <Button variant="secondary" onClick={fn()}>Secondary</Button>
          <Button variant="ghost" onClick={fn()}>Ghost</Button>
          <Button variant="outline" onClick={fn()}>Outline</Button>
          <Button variant="destructive" onClick={fn()}>Destructive</Button>
        </div>
      </div>
      <div>
        <h4 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
          Disabled
        </h4>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" disabled onClick={fn()}>Primary</Button>
          <Button variant="secondary" disabled onClick={fn()}>Secondary</Button>
          <Button variant="ghost" disabled onClick={fn()}>Ghost</Button>
          <Button variant="outline" disabled onClick={fn()}>Outline</Button>
          <Button variant="destructive" disabled onClick={fn()}>Destructive</Button>
        </div>
      </div>
      <div>
        <h4 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
          Loading
        </h4>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" loading onClick={fn()}>Loading</Button>
          <Button variant="secondary" loading onClick={fn()}>Loading</Button>
          <Button variant="ghost" loading onClick={fn()}>Loading</Button>
          <Button variant="outline" loading onClick={fn()}>Loading</Button>
          <Button variant="destructive" loading onClick={fn()}>Loading</Button>
        </div>
      </div>
    </div>
  ),
};

// ============================================================================
// Pre-configured Export Variants
// ============================================================================

export const ExportVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
          PrimaryButton
        </h4>
        <PrimaryButton onClick={fn()}>Primary Action</PrimaryButton>
      </div>
      <div>
        <h4 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
          SecondaryButton
        </h4>
        <SecondaryButton onClick={fn()}>Secondary Action</SecondaryButton>
      </div>
      <div>
        <h4 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
          GhostButton
        </h4>
        <GhostButton onClick={fn()}>Ghost Action</GhostButton>
      </div>
      <div>
        <h4 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
          DestructiveButton
        </h4>
        <DestructiveButton onClick={fn()}>Delete</DestructiveButton>
      </div>
      <div>
        <h4 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
          OutlineButton
        </h4>
        <OutlineButton onClick={fn()}>Outline Action</OutlineButton>
      </div>
    </div>
  ),
};

// ============================================================================
// Dark Mode Preview
// ============================================================================

export const DarkMode: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3 p-4 bg-neutral-900 rounded-lg">
      <Button variant="primary" onClick={fn()}>Primary</Button>
      <Button variant="secondary" onClick={fn()}>Secondary</Button>
      <Button variant="ghost" onClick={fn()}>Ghost</Button>
      <Button variant="outline" onClick={fn()}>Outline</Button>
      <Button variant="destructive" onClick={fn()}>Destructive</Button>
    </div>
  },
  decorators: [], // Remove the default light decorator
};