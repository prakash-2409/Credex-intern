import * as React from "react";

import { cn } from "@/lib/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function Card({ className, ...props }, ref) {
  return <div ref={ref} className={cn("rounded-[1.75rem] border border-border bg-surface shadow-soft", className)} {...props} />;
});

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function CardHeader({ className, ...props }, ref) {
  return <div ref={ref} className={cn("flex flex-col gap-1.5 p-6", className)} {...props} />;
});

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(function CardTitle({ className, ...props }, ref) {
  return <h3 ref={ref} className={cn("text-lg font-semibold tracking-tight text-foreground", className)} {...props} />;
});

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(function CardDescription(
  { className, ...props },
  ref,
) {
  return <p ref={ref} className={cn("text-sm leading-6 text-muted", className)} {...props} />;
});

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function CardContent({ className, ...props }, ref) {
  return <div ref={ref} className={cn("px-6 pb-6", className)} {...props} />;
});

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function CardFooter({ className, ...props }, ref) {
  return <div ref={ref} className={cn("flex items-center px-6 pb-6 pt-0", className)} {...props} />;
});

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };