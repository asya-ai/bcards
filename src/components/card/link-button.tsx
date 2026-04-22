"use client";

import { trackEvent } from "./tracker";
import { ServiceIcon } from "./service-icon";

interface LinkButtonProps {
  id: string;
  title: string;
  url: string;
  icon: string | null;
}

export function LinkButton({ id, title, url, icon }: LinkButtonProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackEvent("link_click", { linkId: id })}
      className="group flex w-full items-center gap-3 rounded-xl border border-[var(--color-secondary-5)] bg-[var(--color-secondary-2)] px-4 py-3.5 font-medium text-[var(--color-font)] transition-all hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-secondary-3)] hover:shadow-lg hover:shadow-[var(--color-primary)]/5"
    >
      <ServiceIcon icon={icon} url={url} className="h-5 w-5 shrink-0 text-[var(--color-font)]/40 transition-colors group-hover:text-[var(--color-primary)]" />
      <span className="flex-1 text-center transition-colors group-hover:text-[var(--color-primary)]">{title}</span>
      <svg
        className="h-4 w-4 shrink-0 opacity-0 transition-all group-hover:opacity-60"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  );
}