import * as React from "react";
import { cn } from "@/lib/utils";
import { IconEye, IconEyeOff, IconRefresh } from "@tabler/icons-react";
import * as LabelPrimitive from "@radix-ui/react-label";
import {
  getInputBaseStyles,
  getInputContainerStyles,
  getInputLabelStyles,
  getInputErrorStyles,
} from "./inputStyles";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label text displayed above the input */
  label?: string;
  /** Error message to display below the input */
  error?: string;
  /** Icon displayed at the start (inline-start) of the input */
  startIcon?: React.ReactNode;
  /** Icon displayed at the end (inline-end) of the input - not shown for password fields */
  endIcon?: React.ReactNode;
  /** Additional class name for the container div */
  containerClassName?: string;
  /** Show password generator button (only for password type inputs) */
  showPasswordGenerator?: boolean;
  /**
   * Callback fired when password is generated.
   * Returns the generated password string.
   * Use this to set form values in react-hook-form or other form libraries.
   */
  onPasswordGenerate?: (password: string) => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      label,
      error,
      startIcon,
      endIcon,
      containerClassName,
      id,
      showPasswordGenerator = false,
      onPasswordGenerate,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;

    // Handle password visibility toggle
    const [showPassword, setShowPassword] = React.useState(false);
    const isPasswordField = type === "password";
    const actualType = isPasswordField
      ? showPassword
        ? "text"
        : "password"
      : type;

    /**
     * Generates a secure password following the pattern: Abcde@123
     * (1 uppercase + 4 lowercase letters + @ + 3 numbers)
     */
    const generatePassword = (): string => {
      const uppercaseLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const lowercaseLetters = "abcdefghijklmnopqrstuvwxyz";
      const numbers = "0123456789";

      let password = "";

      // 1 random uppercase letter (first character)
      password +=
        uppercaseLetters[Math.floor(Math.random() * uppercaseLetters.length)];

      // 4 random lowercase letters
      for (let i = 0; i < 4; i++) {
        password +=
          lowercaseLetters[Math.floor(Math.random() * lowercaseLetters.length)];
      }

      // @ symbol
      password += "@";

      // 3 random numbers
      for (let i = 0; i < 3; i++) {
        password += numbers[Math.floor(Math.random() * numbers.length)];
      }

      return password;
    };

    const handlePasswordGeneration = () => {
      const password = generatePassword();

      // Show the generated password
      setShowPassword(true);

      // Notify parent component with the generated password
      if (onPasswordGenerate) {
        onPasswordGenerate(password);
      }
    };

    // Create icons for password field
    const passwordIcons = isPasswordField ? (
      <div className="flex items-center gap-2">
        {showPasswordGenerator && (
          <button
            type="button"
            onClick={handlePasswordGeneration}
            className="text-white hover:text-(--primaryColor) transition-colors"
            aria-label="Generate password"
            title="Generate random password"
          >
            <IconRefresh className="h-5 w-5" />
          </button>
        )}
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="text-white hover:text-(--text) transition-colors"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <IconEyeOff className="h-5 w-5" />
          ) : (
            <IconEye className="h-5 w-5" />
          )}
        </button>
      </div>
    ) : (
      endIcon
    );

    return (
      <div className={getInputContainerStyles(containerClassName)}>
        {label && (
          <LabelPrimitive.Root
            htmlFor={inputId}
            className={getInputLabelStyles()}
          >
            {label}
            {props.required && (
              <span className="text-(--primaryColor) ms-1" aria-hidden="true">
                *
              </span>
            )}
          </LabelPrimitive.Root>
        )}

        <div className="relative">
          {startIcon && (
            <div className="absolute start-3 top-1/2 -translate-y-1/2 text-white">
              {startIcon}
            </div>
          )}

          <input
            type={actualType}
            id={inputId}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? errorId : undefined}
            aria-required={props.required ? "true" : undefined}
            className={cn(
              getInputBaseStyles(error, {
                start: !!startIcon,
                end: !!(endIcon || isPasswordField),
              }),
              // Extra padding for generate + eye icons in password field
              showPasswordGenerator && isPasswordField && "pe-16",
              className
            )}
            ref={ref}
            {...props}
          />

          {passwordIcons && (
            <div className="absolute end-3 top-1/2 -translate-y-1/2 text-white">
              {passwordIcons}
            </div>
          )}
        </div>

        {error && (
          <p
            id={errorId}
            className={getInputErrorStyles()}
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
