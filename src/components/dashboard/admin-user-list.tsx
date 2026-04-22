"use client";

import { deleteUser } from "@/app/dashboard/actions";
import Link from "next/link";
import { useTransition } from "react";

interface UserWithCounts {
  id: string;
  username: string;
  displayName: string;
  company: string | null;
  email: string | null;
  redirectUrl: string | null;
  createdAt: Date;
  links: unknown[];
  contactSubmissions: unknown[];
}

export function AdminUserList({ users }: { users: UserWithCounts[] }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete(userId: string, name: string) {
    if (!confirm(`Delete card for "${name}"? This cannot be undone.`)) return;
    startTransition(() => {
      deleteUser(userId);
    });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://bcard.asya.ai";

  return (
    <div className="mt-6 space-y-3">
      {users.length === 0 ? (
        <div className="rounded-xl border border-[var(--color-secondary-4)] bg-[var(--color-secondary-2)] p-12 text-center">
          <p className="text-[var(--color-font)]/40">No cards yet.</p>
        </div>
      ) : (
        users.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between rounded-xl border border-[var(--color-secondary-4)] bg-[var(--color-secondary-2)] p-4"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <p className="font-medium text-[var(--color-font)]">
                  {user.displayName}
                </p>
                {user.redirectUrl && (
                  <span className="rounded bg-[var(--color-secondary-5)] px-2 py-0.5 text-xs text-[var(--color-font)]/60">
                    redirect
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-4 text-xs text-[var(--color-font)]/40">
                <a
                  href={`${appUrl}/${user.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-primary)]/60 hover:text-[var(--color-primary)]"
                >
                  /{user.username}
                </a>
                {user.company && <span>{user.company}</span>}
                <span>{user.links.length} links</span>
                <span>{user.contactSubmissions.length} messages</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/dashboard/admin/${user.id}`}
                className="rounded-lg bg-[var(--color-secondary-4)] px-3 py-1.5 text-sm font-medium text-[var(--color-font)] transition-colors hover:bg-[var(--color-secondary-5)]"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(user.id, user.displayName)}
                disabled={isPending}
                className="cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium text-red-400/60 transition-colors hover:bg-red-400/10 hover:text-red-400 disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}