"use client";

import { cn } from "@/lib/utils";

export type BadgeVariant = "primary" | "secondary" | "danger" | "default";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const base = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold";

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-neutral-700 text-white",
  primary: "bg-blue-600 text-white",
  secondary: "bg-neutral-500 text-white",
  danger: "bg-red-600 text-white",
};

export const Badge = ({ variant = "default", className, ...props }: BadgeProps) => {
  return (
    <span
      className={cn(base, variantClasses[variant], className)}
      {...props}
    />
  );
};
