import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import * as AccessibleIcon from "@radix-ui/react-accessible-icon";
import { cva, type VariantProps } from "class-variance-authority";
import { Link } from "@/i18n/navigation";
import { IconLoader2 } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-[transform,opacity] duration-200 ease-out overflow-visible rounded-[30px] disabled:pointer-events-none disabled:opacity-50 relative select-none cursor-pointer box-border",
  {
    variants: {
      variant: {
        default: [
          // Base styles with brand primary background
          "bg-brand-primary hover:bg-brand-primary/90 text-button-text border border-transparent",
          // Subtle overlay gradient
          "[background-image:linear-gradient(to_bottom,rgba(108,108,108,0.15),transparent)]",
        ].join(" "),
        destructive:
          "bg-red-600 text-white hover:bg-red-700 border border-transparent",
        success: [
          "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25",
          "[text-shadow:0px_0px_0.5px_#ffffff]",
        ].join(" "),
        error: [
          "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25",
          "[text-shadow:0px_0px_0.5px_#ffffff]",
        ].join(" "),
        outline:
          "border border-border-primary bg-transparent text-text-primary hover:bg-surface-hover hover:border-text-muted/30",
        secondary: [
          "bg-white/10 hover:bg-white/15 border border-white/20 text-white",
          "before:content-[''] before:absolute before:-top-[1px] before:-left-[1px] before:-z-[1]",
          "before:w-[calc(100%+2px)] before:h-[calc(100%+2px)] before:rounded-[30px] before:p-[1px]",
          "before:bg-gradient-to-b before:from-white/20 before:to-white/5",
        ].join(" "),
        ghost:
          "bg-transparent hover:bg-white/10 border border-transparent text-white/70 hover:text-white",
        link: "text-text-primary underline-offset-4 hover:underline",
        "auth-link":
          "text-brand-primary hover:text-brand-primary-light font-semibold hover:underline text-sm",
        "muted-link": "text-text-muted hover:text-text-body",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-6",
        xl: "h-12 px-8",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// Keep the ripple effect with theme variable support
const RIPPLE_STYLE = `
.button-ripple-wrapper {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}
.button-ripple {
  position: absolute;
  border-radius: 50%;
  transform: scale(0);
  animation: ripple 600ms ease-out;
  background-color: var(--ripple-color, rgba(255, 255, 255, 0.25));
}

@keyframes ripple {
  0% {
    transform: scale(0);
    opacity: 0.6;
  }
  50% {
    opacity: 0.3;
  }
  to {
    transform: scale(4);
    opacity: 0;
  }
}
`;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  href?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  loading?: boolean;
  loadingText?: string;
  // Optional classes applied to the internal content wrapper span
  contentClassName?: string;
  // Accessibility label for icon-only buttons
  iconLabel?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      onClick,
      href,
      startIcon,
      endIcon,
      loading = false,
      loadingText,
      contentClassName,
      id,
      iconLabel,
      children,
      ...props
    },
    ref
  ) => {
    // Check if this is an icon-only button (no text children)
    const isIconOnly =
      !children && (startIcon || endIcon) && !loading && !loadingText;

    // Keep the ripple animation style element
    React.useEffect(() => {
      const styleElement = document.createElement("style");
      styleElement.innerHTML = RIPPLE_STYLE;
      document.head.appendChild(styleElement);
      return () => {
        document.head.removeChild(styleElement);
      };
    }, []);

    // Handle ripple effect
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
      const button = event.currentTarget as HTMLElement;

      // Ensure ripple wrapper exists
      let wrapper = button.querySelector(
        ".button-ripple-wrapper"
      ) as HTMLSpanElement | null;
      if (!wrapper) {
        wrapper = document.createElement("span");
        wrapper.className = "button-ripple-wrapper";
        button.prepend(wrapper);
      }

      const ripple = document.createElement("span");

      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;

      // Get the computed styles
      const computedStyle = window.getComputedStyle(button);

      // More robust approach to ripple colors
      let rippleColor;

      // Get theme variables for ripple colors with fallbacks
      const rootStyles = getComputedStyle(document.documentElement);

      // Force specific ripple colors based on variant for consistency
      if (variant === "default") {
        // Primary button - white ripple on orange background
        rippleColor = "rgba(255, 255, 255, 0.25)";
      } else if (variant === "secondary") {
        // Secondary button - use theme variables with fallback
        const secondaryText = rootStyles.getPropertyValue("--text").trim();
        rippleColor = secondaryText
          ? "rgba(0, 0, 0, 0.1)"
          : "rgba(0, 0, 0, 0.1)"; // Always use a subtle dark ripple
      } else if (variant === "destructive") {
        // Destructive button - white ripple on red background
        rippleColor = "rgba(255, 255, 255, 0.25)";
      } else if (variant === "auth-link" || variant === "link") {
        // Link variants - use primary color ripple
        const primaryColor = rootStyles
          .getPropertyValue("--primaryColor")
          .trim();
        rippleColor = primaryColor
          ? "rgba(59, 130, 246, 0.2)"
          : "rgba(59, 130, 246, 0.2)";
      } else {
        // Fallback for other variants - use a more general approach
        const colorMatch = computedStyle.color.match(
          /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/
        );
        const isLightText = colorMatch && parseInt(colorMatch[1]) > 200;

        rippleColor = isLightText
          ? "rgba(255, 255, 255, 0.2)"
          : "rgba(0, 0, 0, 0.1)";
      }

      ripple.className = "button-ripple";
      ripple.style.setProperty("--ripple-color", rippleColor);
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      wrapper.appendChild(ripple);

      // Clean up after animation completes
      setTimeout(() => {
        ripple.remove();
      }, 600);

      if (onClick) {
        onClick(event as React.MouseEvent<HTMLButtonElement>);
      }
    };

    // If href is provided, render as Link or anchor
    if (href) {
      const renderIcon = (icon: React.ReactNode, label?: string) => {
        if (!label || typeof icon !== "object") return icon;
        return <AccessibleIcon.Root label={label}>{icon}</AccessibleIcon.Root>;
      };

      // Check if it's an external URL
      const isExternal =
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:");

      const buttonContent = (
        <>
          <span className="button-ripple-wrapper" aria-hidden />
          <span
            className={cn(
              "z-1 inline-flex items-center justify-center w-full",
              contentClassName
            )}
          >
            {loading && (
              <AccessibleIcon.Root label="Loading">
                <IconLoader2 className="me-2 h-4 w-4 animate-spin" />
              </AccessibleIcon.Root>
            )}
            {!loading && startIcon && (
              <span className="me-2 flex items-center">
                {renderIcon(startIcon, iconLabel)}
              </span>
            )}
            {loading ? loadingText || children : children}
            {!loading && endIcon && (
              <span className="ms-2 flex items-center">
                {renderIcon(endIcon, iconLabel)}
              </span>
            )}
          </span>
        </>
      );

      // Use regular anchor for external links
      if (isExternal) {
        return (
          <a
            href={href}
            id={id}
            className={cn(buttonVariants({ variant, size, className }))}
            onClick={handleClick}
            aria-label={isIconOnly ? iconLabel : undefined}
            aria-busy={loading ? "true" : undefined}
            aria-disabled={props.disabled ? "true" : undefined}
            target="_blank"
            rel="noopener noreferrer"
            {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
          >
            {buttonContent}
          </a>
        );
      }

      // Use i18n Link for internal links (handles locale automatically)
      return (
        <Link
          href={href}
          id={id}
          className={cn(buttonVariants({ variant, size, className }))}
          onClick={handleClick}
          aria-label={isIconOnly ? iconLabel : undefined}
          aria-busy={loading ? "true" : undefined}
          aria-disabled={props.disabled ? "true" : undefined}
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {buttonContent}
        </Link>
      );
    }

    const Comp = asChild ? Slot : "button";

    if (asChild) {
      // IMPORTANT: Slot requires exactly one React element child.
      // Do not inject wrappers or multiple children here.
      return (
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          {...props}
          // For asChild, avoid setting disabled on non-button elements
          onClick={handleClick}
        >
          {children as React.ReactElement}
        </Comp>
      );
    }

    const renderIcon = (icon: React.ReactNode, label?: string) => {
      if (!label || typeof icon !== "object") return icon;
      return <AccessibleIcon.Root label={label}>{icon}</AccessibleIcon.Root>;
    };

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        id={id}
        ref={ref}
        {...props}
        disabled={loading || props.disabled}
        onClick={handleClick}
        aria-label={isIconOnly ? iconLabel : undefined}
        aria-busy={loading ? "true" : undefined}
      >
        <span className="button-ripple-wrapper" aria-hidden />
        <span
          className={cn(
            "z-1 inline-flex items-center justify-center",
            contentClassName
          )}
        >
          {loading && (
            <AccessibleIcon.Root label="Loading">
              <IconLoader2 className="me-2 h-4 w-4 animate-spin" />
            </AccessibleIcon.Root>
          )}
          {!loading && startIcon && (
            <span className="me-2 flex items-center">
              {renderIcon(startIcon, iconLabel)}
            </span>
          )}
          {loading ? loadingText || children : children}
          {!loading && endIcon && (
            <span className="ms-2 flex items-center">
              {renderIcon(endIcon, iconLabel)}
            </span>
          )}
        </span>
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
