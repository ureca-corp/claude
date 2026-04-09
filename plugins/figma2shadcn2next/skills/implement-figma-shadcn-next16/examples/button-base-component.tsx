/**
 * Example: Button base component output
 * Source: Figma node "Button / Primary / Default" in Ureca Shadcn library
 *
 * This file demonstrates the expected output format including:
 * - Inline token comments (// token: usage → semantic → primitive)
 * - Raw value comments (// raw: no token binding)
 * - Two theming strategy variants (see Strategy A / B below)
 *
 * figma-token-auditor will validate these comments against actual variable defs.
 * figma-fidelity-reviewer will compare this against the Figma screenshot.
 */

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// ── Strategy A: css-variables (shadcn default) ────────────────────────────
// Project uses :root / .dark CSS variable definitions in globals.css.
// Usage aliases (bg-primary, text-primary-foreground) resolve via CSS variables.

const buttonVariantsCSSVar = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "whitespace-nowrap",
    "text-sm",           // token: text-sm → semantic/typography/body/sm → primitive/14px
    "font-medium",       // token: font-medium → semantic/typography/weight/medium → primitive/500
    "ring-offset-background",  // token: ring-offset-background → semantic/color/ring-offset → CSS var
    "transition-colors",
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-ring",   // token: ring → semantic/color/ring/default → CSS var
    "focus-visible:ring-offset-2",
    "disabled:pointer-events-none",
    "disabled:opacity-50",       // token: opacity-50 → semantic/state/disabled/opacity → primitive/0.5
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-primary",                  // token: bg-primary → semantic/color/bg/brand → CSS var --primary
          "text-primary-foreground",     // token: text-primary-foreground → semantic/color/text/on-brand → CSS var --primary-foreground
          "hover:bg-primary/90",         // token: bg-primary/90 → semantic/color/bg/brand → CSS var with 90% opacity
        ],
        destructive: [
          "bg-destructive",              // token: bg-destructive → semantic/color/bg/danger → CSS var --destructive
          "text-destructive-foreground", // token: text-destructive-foreground → semantic/color/text/on-danger → CSS var
          "hover:bg-destructive/90",
        ],
        outline: [
          "border border-input",         // token: border-input → semantic/color/border/input → CSS var --input
          "bg-background",               // token: bg-background → semantic/color/bg/default → CSS var --background
          "hover:bg-accent",             // token: bg-accent → semantic/color/bg/accent → CSS var --accent
          "hover:text-accent-foreground",// token: text-accent-foreground → semantic/color/text/on-accent → CSS var
        ],
        secondary: [
          "bg-secondary",                // token: bg-secondary → semantic/color/bg/secondary → CSS var --secondary
          "text-secondary-foreground",   // token: text-secondary-foreground → semantic/color/text/on-secondary → CSS var
          "hover:bg-secondary/80",
        ],
        ghost: [
          "hover:bg-accent",
          "hover:text-accent-foreground",
        ],
        link: [
          "text-primary",                // token: text-primary → semantic/color/text/brand → CSS var --primary
          "underline-offset-4",
          "hover:underline",
        ],
      },
      size: {
        default: [
          "h-10",    // token: h-10 → semantic/size/button/default → primitive/40px
          "px-4",    // token: spacing-4 → semantic/space/4 → primitive/16px
          "py-2",    // token: spacing-2 → semantic/space/2 → primitive/8px
        ],
        sm: [
          "h-9",           // token: h-9 → semantic/size/button/sm → primitive/36px
          "rounded-md",    // token: radius-md → semantic/radius/md → primitive/6px
          "px-3",          // token: spacing-3 → semantic/space/3 → primitive/12px
        ],
        lg: [
          "h-11",          // token: h-11 → semantic/size/button/lg → primitive/44px
          "rounded-md",    // token: radius-md → semantic/radius/md → primitive/6px
          "px-8",          // token: spacing-8 → semantic/space/8 → primitive/32px
        ],
        icon: [
          "h-10 w-10",     // token: h-10/w-10 → semantic/size/button/icon → primitive/40px
        ],
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// ── Strategy B: tailwind-dark-variant ─────────────────────────────────────
// Project does NOT use CSS variables. Explicit dark: classes used.
// Comment format: // token: usage → semantic → primitive (dark: dark-primitive)

const buttonVariantsTailwindDark = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "whitespace-nowrap",
    "text-sm font-medium",
    "transition-colors",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-blue-600 dark:bg-blue-500",          // token: bg-primary → semantic/color/bg/brand → primitive/blue-600 (dark: primitive/blue-500)
          "text-white dark:text-white",             // token: text-primary-foreground → semantic/color/text/on-brand → primitive/white (dark: primitive/white)
          "hover:bg-blue-700 dark:hover:bg-blue-400",
        ],
        outline: [
          "border border-gray-200 dark:border-gray-700",  // token: border-input → semantic/color/border/input → primitive/gray-200 (dark: primitive/gray-700)
          "bg-white dark:bg-gray-950",                     // token: bg-background → semantic/color/bg/default → primitive/white (dark: primitive/gray-950)
          "text-gray-900 dark:text-gray-50",               // token: text-foreground → semantic/color/text/default → primitive/gray-900 (dark: primitive/gray-50)
        ],
      },
      size: {
        default: ["h-10 px-4 py-2 rounded-md"],  // token: radius-md → semantic/radius/md → primitive/6px
        sm: ["h-9 px-3 rounded-sm"],              // token: radius-sm → semantic/radius/sm → primitive/4px
        lg: ["h-11 px-8 rounded-md"],
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// ── Props Interface ────────────────────────────────────────────────────────

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariantsCSSVar> {
  asChild?: boolean
}

// ── Component (Strategy A — css-variables) ────────────────────────────────

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariantsCSSVar({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

// ── IMPLEMENTATION NOTES ──────────────────────────────────────────────────
//
// Token chain summary for this component:
//
// | Usage Alias           | Semantic                    | Primitive (Light) | Primitive (Dark) |
// |-----------------------|-----------------------------|-------------------|------------------|
// | bg-primary            | color/bg/brand              | blue-600          | blue-500         |
// | text-primary-fg       | color/text/on-brand         | white             | white            |
// | bg-background         | color/bg/default            | white             | gray-950         |
// | border-input          | color/border/input          | gray-200          | gray-700         |
// | ring                  | color/ring/default          | blue-600          | blue-500         |
// | radius-md             | radius/md                   | 6px               | —                |
// | spacing-4             | space/4                     | 16px              | —                |
//
// shadcn/ui install:
//   npx shadcn@latest add button
//
// Unresolved items: 0
// Audit result: PASS (hypothetical — run figma-token-auditor on actual output)
