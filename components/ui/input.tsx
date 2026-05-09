import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, type = "text", ...props },
  ref,
) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-full border border-border bg-surface px-4 text-sm text-foreground shadow-sm transition-all duration-200 placeholder:text-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 motion-safe:focus-visible:scale-[1.01]",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});

export { Input };