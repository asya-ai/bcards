"use client";

import { useState } from "react";
import { trackEvent } from "./tracker";

export function AddToContacts({ username }: { username: string }) {
  const [loading, setLoading] = useState(false);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    trackEvent("vcard_download");

    const vcardPath = `/${username}/vcard`;

    try {
      window.location.href = vcardPath;
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="group flex w-full cursor-pointer items-center gap-3 rounded-xl border border-[var(--color-secondary-5)] bg-[var(--color-secondary-2)] px-4 py-3.5 font-medium text-[var(--color-font)] transition-all hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-secondary-3)] hover:shadow-lg hover:shadow-[var(--color-primary)]/5 disabled:cursor-not-allowed disabled:opacity-70"
    >
      <svg
        className="h-5 w-5 shrink-0 text-[var(--color-font)]/40 transition-colors group-hover:text-[var(--color-primary)]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
      <span className="flex-1 text-center transition-colors group-hover:text-[var(--color-primary)]">{loading ? "Opening..." : "Add to Contacts"}</span>
      <svg
        className="h-4 w-4 shrink-0 opacity-0 transition-all group-hover:opacity-60"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </button>
  );
}