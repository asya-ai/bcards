import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { contactSubmissions, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { ensureUserExists } from "../actions";

export default async function SubmissionsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const user = await ensureUserExists();

  const submissions = await db.query.contactSubmissions.findMany({
    where: eq(contactSubmissions.userId, user.id),
    orderBy: [desc(contactSubmissions.createdAt)],
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--color-font)]">Messages</h1>
      <p className="mt-1 text-sm text-[var(--color-font)]/60">
        Contact form submissions from your card
      </p>

      {submissions.length === 0 ? (
        <div className="mt-8 rounded-xl border border-[var(--color-secondary-4)] bg-[var(--color-secondary-2)] p-12 text-center">
          <p className="text-[var(--color-font)]/40">No messages yet.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="rounded-xl border border-[var(--color-secondary-4)] bg-[var(--color-secondary-2)] p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-[var(--color-font)]">{sub.name}</p>
                  <p className="text-sm text-[var(--color-primary)]">{sub.email}</p>
                </div>
                <time className="text-xs text-[var(--color-font)]/40">
                  {new Date(sub.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-[var(--color-font)]/80">
                {sub.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}