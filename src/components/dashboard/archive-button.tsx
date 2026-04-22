"use client";

import { useTransition } from "react";
import { clearAnalytics } from "@/app/dashboard/actions";

export function ArchiveButton() {
  const [isPending, startTransition] = useTransition();

  function handleClear() {
    if (!confirm("Clear all analytics history? This cannot be undone.")) return;
    startTransition(() => {
      clearAnalytics();
    });
  }

  return (
    <button
      onClick={handleClear}
      disabled={isPending}
      className="cursor-pointer rounded-lg border border-[var(--color-secondary-5)] px-4 py-2 text-sm font-medium text-[var(--color-font)]/60 transition-colors hover:border-red-400/30 hover:text-red-400 disabled:opacity-50"
    >
      {isPending ? "Clearing..." : "Clear History"}
    </button>
  );
}