import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export default function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  const describedBy = error ? `${htmlFor}-error` : hint ? `${htmlFor}-hint` : undefined;

  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="block text-sm font-medium">
        {label}
      </label>
      <div className={cn(describedBy && "[&_input]:aria-[invalid=true]:border-red-500")}>
        {children}
      </div>
      {hint && !error ? (
        <p id={`${htmlFor}-hint`} className="text-xs leading-5 text-zinc-500">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const inputClassName =
  "min-h-11 w-full rounded-xl border border-zinc-200/80 bg-white px-3 text-base text-zinc-950 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)] dark:border-zinc-800 dark:bg-zinc-900 dark:text-white";
