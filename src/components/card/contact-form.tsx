"use client";

import { useState } from "react";
import { trackEvent } from "./tracker";

export function ContactForm({ username }: { username: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch(`/api/contact/${username}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          message: data.get("message"),
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to send message");
      }

      setStatus("success");
      trackEvent("contact_form");
      form.reset();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl border border-[var(--color-secondary-5)] bg-[var(--color-secondary-2)] p-6 text-center">
        <svg className="mx-auto h-10 w-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="mt-3 font-medium text-[var(--color-font)]">Message sent!</p>
        <p className="mt-1 text-sm text-[var(--color-font)]/60">Thank you for reaching out.</p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-4 text-sm text-[var(--color-primary)] hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-[var(--color-secondary-5)] bg-[var(--color-secondary-2)] p-6">
      <h3 className="mb-4 text-lg font-semibold text-[var(--color-font)]">Get in touch</h3>
      <div className="space-y-3">
        <input
          name="name"
          type="text"
          placeholder="Your name"
          required
          className="w-full rounded-lg border border-[var(--color-secondary-5)] bg-[var(--color-secondary-3)] px-4 py-2.5 text-sm text-[var(--color-font)] placeholder-[var(--color-font)]/40 outline-none transition-colors focus:border-[var(--color-primary)]/50"
        />
        <input
          name="email"
          type="email"
          placeholder="Your email"
          required
          className="w-full rounded-lg border border-[var(--color-secondary-5)] bg-[var(--color-secondary-3)] px-4 py-2.5 text-sm text-[var(--color-font)] placeholder-[var(--color-font)]/40 outline-none transition-colors focus:border-[var(--color-primary)]/50"
        />
        <textarea
          name="message"
          placeholder="Your message"
          required
          rows={4}
          className="w-full resize-none rounded-lg border border-[var(--color-secondary-5)] bg-[var(--color-secondary-3)] px-4 py-2.5 text-sm text-[var(--color-font)] placeholder-[var(--color-font)]/40 outline-none transition-colors focus:border-[var(--color-primary)]/50"
        />
      </div>

      {status === "error" && (
        <p className="mt-2 text-sm text-red-400">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-4 w-full cursor-pointer rounded-lg bg-[var(--color-primary)] px-4 py-2.5 font-semibold text-[var(--color-font-contrast)] transition-colors hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "loading" ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}