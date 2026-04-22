import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { AdminUserList } from "@/components/dashboard/admin-user-list";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.isAdmin) redirect("/dashboard");

  const allUsers = await db.query.users.findMany({
    orderBy: [desc(users.createdAt)],
    with: {
      links: true,
      contactSubmissions: true,
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--color-font)]">All Cards</h1>
      <p className="mt-1 text-sm text-[var(--color-font)]/60">
        Manage all business cards ({allUsers.length} total)
      </p>

      <AdminUserList users={allUsers} />
    </div>
  );
}