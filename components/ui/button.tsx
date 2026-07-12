"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const button = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-[transform,background-color,opacity] duration-150 active:scale-[0.96] disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-fuel text-[#04120c] hover:bg-fuel-press shadow-[0_6px_20px_rgba(0,229,160,0.22)]",
        heat: "bg-heat text-[#1a0a04] hover:brightness-95 shadow-[0_6px_20px_rgba(255,107,74,0.20)]",
        surface:
          "bg-surface-2 text-ink border border-line hover:bg-surface-3",
        ghost: "bg-transparent text-muted hover:text-ink hover:bg-surface-2",
        outline: "bg-transparent text-ink border border-line-strong hover:bg-surface-2",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-5 text-[15px]",
        lg: "h-13 px-6 text-base",
        icon: "h-11 w-11 p-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(button({ variant, size }), className)} {...props} />
  )
);
Button.displayName = "Button";
