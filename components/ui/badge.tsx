import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badge = cva(
  "inline-flex items-center gap-1 rounded-full font-semibold leading-none",
  {
    variants: {
      tone: {
        neutral: "bg-surface-2 text-muted",
        fuel: "bg-fuel/12 text-fuel",
        heat: "bg-heat/12 text-heat",
        strain: "bg-strain/15 text-strain",
        amber: "bg-amber/15 text-amber",
      },
      size: {
        sm: "px-2 py-1 text-[11px]",
        md: "px-2.5 py-1 text-xs",
      },
    },
    defaultVariants: { tone: "neutral", size: "md" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badge> {}

export function Badge({ className, tone, size, ...props }: BadgeProps) {
  return <span className={cn(badge({ tone, size }), className)} {...props} />;
}
