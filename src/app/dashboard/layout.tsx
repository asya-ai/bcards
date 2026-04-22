import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard/nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-[var(--color-secondary-1)]">
      <DashboardNav user={session.user} />
      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
    </div>
  );
}