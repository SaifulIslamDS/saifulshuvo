"use client";

import type { MouseEvent, ReactNode } from "react";
import { useFormStatus } from "react-dom";

export function ConfirmSubmitButton({
  children,
  message,
  confirmMessage,
  className,
  variant,
  disabled = false,
}: {
  children: ReactNode;
  message?: string;
  confirmMessage?: string;
  className?: string;
  variant?: "danger" | "default";
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  const resolvedClassName = className ?? (variant === "danger" ? "row-action-danger" : "row-action");
  return (
    <button
      className={resolvedClassName}
      type="submit"
      disabled={pending || disabled}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        if (!window.confirm(confirmMessage ?? message ?? "Continue?")) event.preventDefault();
      }}
    >
      {pending ? "Working…" : children}
    </button>
  );
}
