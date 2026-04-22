import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDefaultPage, getDefaultLinks } from "@/lib/settings";
import { DefaultPageForm } from "@/components/dashboard/default-page-form";
import { DefaultLinksForm } from "@/components/dashboard/default-links-form";

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session?.user?.isAdmin) redirect("/dashboard");

  const defaultPageUrl = await getDefaultPage();
  const defaultLinks = await getDefaultLinks();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-font)]">Settings</h1>
        <p className="mt-1 text-sm text-[var(--color-font)]/60">
          Global configuration for bcard.asya.ai
        </p>
      </div>

      <DefaultPageForm currentUrl={defaultPageUrl ?? ""} />
      <DefaultLinksForm links={defaultLinks} />
    </div>
  );
}