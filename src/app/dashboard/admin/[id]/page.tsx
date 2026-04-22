import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users, links } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { AdminEditForm } from "@/components/dashboard/admin-edit-form";

export default async function AdminEditPage(props: PageProps<"/dashboard/admin/[id]">) {
  const session = await auth();
  if (!session?.user?.isAdmin) redirect("/dashboard");

  const { id } = await props.params;

  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
  });

  if (!user) redirect("/dashboard/admin");

  const userLinks = await db.query.links.findMany({
    where: eq(links.userId, user.id),
    orderBy: (l, { asc }) => [asc(l.sortOrder)],
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-font)]">
          Edit: {user.displayName}
        </h1>
        <p className="mt-1 text-sm text-[var(--color-font)]/60">
          Editing card for /{user.username}
        </p>
      </div>

      <AdminEditForm user={user} links={userLinks} />
    </div>
  );
}