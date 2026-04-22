import { ensureUserExists } from "./actions";
import { db } from "@/lib/db";
import { links } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { LinkManager } from "@/components/dashboard/link-manager";

export default async function DashboardPage() {
  const user = await ensureUserExists();

  const userLinks = await db.query.links.findMany({
    where: eq(links.userId, user.id),
    orderBy: (l, { asc }) => [asc(l.sortOrder)],
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://bcard.asya.ai";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-font)]">My Card</h1>
        <p className="mt-1 text-sm text-[var(--color-font)]/60">
          Your card is live at{" "}
          <a
            href={`${appUrl}/${user.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-primary)] hover:underline"
          >
            {appUrl}/{user.username}
          </a>
        </p>
      </div>

      <ProfileForm user={user} />
      <LinkManager links={userLinks} />
    </div>
  );
}