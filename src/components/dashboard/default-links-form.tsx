"use client";

import { useState, useTransition } from "react";
import { updateDefaultLinks } from "@/app/dashboard/admin/settings/actions";
import type { DefaultLink } from "@/lib/settings";

export function DefaultLinksForm({ links: initialLinks }: { links: DefaultLink[] }) {
  const [links, setLinks] = useState<DefaultLink[]>(initialLinks);
  const [isPending, startTransition] = useTransition();

  function addLink() {
    setLinks([...links, { title: "", url: "" }]);
  }

  function removeLink(index: number) {
    setLinks(links.filter((_, i) => i !== index));
  }

  function updateLink(index: number, field: keyof DefaultLink, value: string) {
    setLinks(links.map((link, i) => (i === index ? { ...link, [field]: value } : link)));
  }

  function handleSave() {
    const filtered = links.filter((l) => l.title && l.url);
    startTransition(async () => {
      await updateDefaultLinks(filtered);
    });
  }

  return (
    <div className="rounded-xl border border-[var(--color-secondary-4)] bg-[var(--color-secondary-2)] p-6">
      <h2 className="mb-2 text-lg font-semibold text-[var(--color-font)]">Default Links</h2>
      <p className="mb-4 text-sm text-[var(--color-font)]/60">
        These links are automatically added to every new user&apos;s card when they first sign in.
      </p>

      <div className="space-y-3">
        {links.map((link, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={link.title}
              onChange={(e) => updateLink(i, "title", e.target.value)}
              placeholder="Title (e.g. LinkedIn)"
              className="w-1/3 rounded-lg border border-[var(--color-secondary-5)] bg-[var(--color-secondary-3)] px-3 py-2 text-sm text-[var(--color-font)] outline-none focus:border-[var(--color-primary)]/50"
            />
            <input
              value={link.url}
              onChange={(e) => updateLink(i, "url", e.target.value)}
              placeholder="https://..."
              className="flex-1 rounded-lg border border-[var(--color-secondary-5)] bg-[var(--color-secondary-3)] px-3 py-2 text-sm text-[var(--color-font)] outline-none focus:border-[var(--color-primary)]/50"
            />
            <button
              onClick={() => removeLink(i)}
              className="cursor-pointer rounded-lg p-2 text-sm text-red-400/60 transition-colors hover:bg-red-400/10 hover:text-red-400"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {links.length === 0 && (
        <p className="text-sm text-[var(--color-font)]/40">No default links configured.</p>
      )}

      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={addLink}
          className="cursor-pointer rounded-lg bg-[var(--color-secondary-4)] px-4 py-2 text-sm font-medium text-[var(--color-font)] transition-colors hover:bg-[var(--color-secondary-5)]"
        >
          + Add Link
        </button>
        <button
          onClick={handleSave}
          disabled={isPending}
          className="cursor-pointer rounded-lg bg-[var(--color-primary)] px-6 py-2.5 font-semibold text-[var(--color-font-contrast)] transition-colors hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}