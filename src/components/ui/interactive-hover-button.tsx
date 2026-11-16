import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type InteractiveHoverButtonVariant =
  | "default"
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "dark";

export type InteractiveHoverButtonSize = "xs" | "sm" | "md" | "lg";

export interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  variant?: InteractiveHoverButtonVariant;
  size?: InteractiveHoverButtonSize;
  icon?: React.ReactNode;
  dotClassName?: string;
  to?: string;
  href?: string;
  target?: string;
  rel?: string;
}

const SIZE_STYLES: Record<InteractiveHoverButtonSize, string> = {
  xs: "h-7.5 pl-6 pr-3.5 text-[11px] gap-1.5",
  sm: "h-9 pl-7 pr-4 text-xs gap-1.5",
  md: "h-10 pl-8 pr-5 text-[13.5px] gap-2",
  lg: "h-11 sm:h-12 pl-9 pr-6 text-sm gap-2",
};

const DOT_POS_STYLES: Record<InteractiveHoverButtonSize, string> = {
  xs: "left-2.5 h-1.5 w-1.5",
  sm: "left-3 h-2 w-2",
  md: "left-3.5 h-2 w-2",
  lg: "left-4 h-2 w-2",
};

const ARROW_SIZE_STYLES: Record<InteractiveHoverButtonSize, string> = {
  xs: "w-3 h-3",
  sm: "w-3.5 h-3.5",
  md: "w-4 h-4",
  lg: "w-4 h-4",
};

const VARIANT_STYLES: Record<InteractiveHoverButtonVariant, string> = {
  default:
    "border border-[var(--border-hairline-dark)] bg-background text-foreground shadow-[var(--shadow-sm)]",
  primary:
    "border border-transparent bg-[var(--accent-orange)] text-white shadow-[0_2px_10px_-2px_rgba(123,44,191,0.45),inset_0_1px_0_rgba(255,255,255,0.22)] hover:shadow-[0_6px_20px_-3px_rgba(123,44,191,0.55)]",
  secondary:
    "border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-[var(--shadow-sm)] hover:border-[var(--accent-orange)]",
  outline:
    "border border-[var(--border-hairline-dark)] bg-transparent text-[var(--text-primary)] hover:border-[var(--accent-orange)]",
  ghost:
    "border border-transparent bg-transparent text-[var(--text-primary)]",
  dark:
    "border border-transparent bg-[var(--ink-dark)] text-white shadow-xs",
};

const VARIANT_DOT_STYLES: Record<InteractiveHoverButtonVariant, string> = {
  default: "bg-primary group-hover:bg-primary",
  primary: "bg-white/90 group-hover:bg-[var(--accent-orange-hover)]",
  secondary: "bg-primary group-hover:bg-primary",
  outline: "bg-primary group-hover:bg-primary",
  ghost: "bg-primary group-hover:bg-primary",
  dark: "bg-primary group-hover:bg-primary",
};

const VARIANT_HOVER_TEXT: Record<InteractiveHoverButtonVariant, string> = {
  default: "text-primary-foreground",
  primary: "text-white",
  secondary: "text-primary-foreground",
  outline: "text-primary-foreground",
  ghost: "text-primary-foreground",
  dark: "text-white",
};

/**
 * Interactive pill button with an expanding dot background, sliding label,
 * and trailing arrow reveal on hover. Supports native buttons, React Router
 * links (`to`), and external/anchor links (`href`).
 */
const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(
  (
    {
      text,
      children,
      variant = "default",
      size = "md",
      icon,
      dotClassName,
      to,
      href,
      target,
      rel,
      className,
      disabled,
      onClick,
      ...props
    },
    ref,
  ) => {
    const label = text ?? children ?? "Button";

    const sharedClasses = cn(
      !disabled && "group",
      "relative inline-flex w-auto cursor-pointer items-center justify-center overflow-hidden rounded-full text-center font-semibold tracking-tight font-sans select-none whitespace-nowrap transition-all duration-300 active:translate-y-[1px] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
      variant === "default" && size === "md" && "min-w-32",
      SIZE_STYLES[size],
      VARIANT_STYLES[variant],
      className,
    );

    const innerContent = (
      <>
        <span className="relative z-[1] inline-flex min-w-0 max-w-full items-center justify-center gap-1.5 transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
          {icon && <span className="shrink-0">{icon}</span>}
          <span className="truncate">{label}</span>
        </span>
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-1.5 px-3 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100",
            VARIANT_HOVER_TEXT[variant],
          )}
        >
          <span className="truncate">{label}</span>
          <ArrowRight className={cn("shrink-0", ARROW_SIZE_STYLES[size])} />
        </div>
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute top-1/2 z-0 -translate-y-1/2 scale-100 rounded-full transition-all duration-300 group-hover:left-0 group-hover:h-full group-hover:w-full group-hover:scale-[1.8]",
            DOT_POS_STYLES[size],
            VARIANT_DOT_STYLES[variant],
            dotClassName,
          )}
        />
      </>
    );

    if (to) {
      return (
        <Link
          to={to}
          className={sharedClasses}
          aria-label={props["aria-label"]}
          title={props.title}
          onClick={
            onClick as unknown as React.MouseEventHandler<HTMLAnchorElement>
          }
        >
          {innerContent}
        </Link>
      );
    }

    if (href) {
      const isExternal = /^https?:\/\//i.test(href);
      const resolvedTarget = target ?? (isExternal ? "_blank" : undefined);
      const resolvedRel =
        rel ?? (resolvedTarget === "_blank" ? "noopener noreferrer" : undefined);
      return (
        <a
          href={href}
          target={resolvedTarget}
          rel={resolvedRel}
          className={sharedClasses}
          aria-label={props["aria-label"]}
          title={props.title}
          onClick={
            onClick as unknown as React.MouseEventHandler<HTMLAnchorElement>
          }
        >
          {innerContent}
        </a>
      );
    }

    return (
      <button
        ref={ref}
        className={sharedClasses}
        disabled={disabled}
        onClick={onClick}
        {...props}
      >
        {innerContent}
      </button>
    );
  },
);

InteractiveHoverButton.displayName = "InteractiveHoverButton";

export { InteractiveHoverButton };
