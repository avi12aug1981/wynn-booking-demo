"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import ButtonLoader from "@/components/ui/atoms/ButtonLoader";

type AppButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  loadingText?: string;
  icon?: ReactNode;
  fullWidth?: boolean;
  variant?: "primary" | "link";
};

export default function AppButton({
  loading = false,
  loadingText,
  icon,
  fullWidth = false,
  variant = "primary",
  className = "",
  children,
  disabled,
  type,
  ...props
}: AppButtonProps) {
  const classes = [
    "btn",
    variant === "link" ? "btn-link" : "btn-primary",
    variant === "primary" ? "group" : "",
    fullWidth ? "btn-full" : "",
    loading ? "btn-loading" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type ?? "button"}
      {...props}
      disabled={disabled || loading}
      className={classes}
    >
      {loading ? (
        <>
          <ButtonLoader />
          <span>{loadingText ?? "Loading"}</span>
        </>
      ) : (
        <>
          <span>{children}</span>
          {icon ? <span className="btn-icon">{icon}</span> : null}
        </>
      )}
    </button>
  );
}
