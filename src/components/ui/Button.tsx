import React from "react";
import {
  InteractiveHoverButton,
  type InteractiveHoverButtonSize,
  type InteractiveHoverButtonVariant,
} from "./interactive-hover-button";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: InteractiveHoverButtonVariant;
  size?: InteractiveHoverButtonSize;
  arrow?: boolean;
  to?: string;
  href?: string;
  icon?: React.ReactNode;
}

/**
 * Shared Button wrapper backed by InteractiveHoverButton so all Button usages
 * inherit the unified hover expansion and arrow reveal animation.
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  arrow: _arrow,
  to,
  href,
  icon,
  className,
  ...props
}) => {
  return (
    <InteractiveHoverButton
      variant={variant}
      size={size}
      to={to}
      href={href}
      icon={icon}
      className={className}
      {...props}
    >
      {children}
    </InteractiveHoverButton>
  );
};

export default Button;
