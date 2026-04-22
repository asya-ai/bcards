"use client";

import { useEffect, useState } from "react";

export function AnalyticsDividerForm({
  action,
}: {
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [timezoneOffsetMinutes, setTimezoneOffsetMinutes] = useState("0");

  useEffect(() => {
    setTimezoneOffsetMinutes(String(new Date().getTimezoneOffset()));
  }, []);

  return (
    <form action={action} className="mt-4 grid gap-3 sm:grid-cols-[1fr_220px_auto]">
      <input
        name="title"
        required
        placeholder="Event name (e.g. LinkedIn post)"
        className="rounded-lg border border-[var(--color-secondary-5)] bg-[var(--color-secondary-3)] px-3 py-2 text-sm text-[var(--color-font)] outline-none focus:border-[var(--color-primary)]/50"
      />
      <input
        type="datetime-local"
        name="eventAt"
        required
        className="rounded-lg border border-[var(--color-secondary-5)] bg-[var(--color-secondary-3)] px-3 py-2 text-sm text-[var(--color-font)] outline-none focus:border-[var(--color-primary)]/50"
      />
      <input type="hidden" name="timezoneOffsetMinutes" value={timezoneOffsetMinutes} />
      <button
        type="submit"
        className="cursor-pointer rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-font-contrast)] transition-colors hover:bg-[var(--color-primary-hover)]"
      >
        Add event
      </button>
    </form>
  );
}
