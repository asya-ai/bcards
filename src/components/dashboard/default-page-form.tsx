"use client";

import { updateDefaultPage } from "@/app/dashboard/admin/settings/actions";
import { useTransition } from "react";

export function DefaultPageForm({ currentUrl }: { currentUrl: string }) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(() => {
      updateDefaultPage(formData);
    });
  }

  return (
    <form
      action={handleSubmit}
      className="rounded-xl border border-[var(--color-secondary-4)] bg-[var(--color-secondary-2)] p-6"
    >
      <h2 className="mb-2 text-lg font-semibold text-[var(--color-font)]">Default Page</h2>
      <p className="mb-4 text-sm text-[var(--color-font)]/60">
        When a visitor hits an unrecognized username (e.g. a mistyped QR link), they will be
        redirected to this URL. Leave empty to show a 404 page.
      </p>

      <div>
        <label className="block text-sm font-medium text-[var(--color-font)]/80">
          Default redirect URL
        </label>
        <input
          name="defaultPageUrl"
          type="url"
          defaultValue={currentUrl}
          placeholder="https://asya.ai"
          className="mt-1 w-full rounded-lg border border-[var(--color-secondary-5)] bg-[var(--color-secondary-3)] px-4 py-2.5 text-sm text-[var(--color-font)] outline-none transition-colors focus:border-[var(--color-primary)]/50"
        />
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="cursor-pointer rounded-lg bg-[var(--color-primary)] px-6 py-2.5 font-semibold text-[var(--color-font-contrast)] transition-colors hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}