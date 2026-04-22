"use server";

import { auth } from "@/lib/auth";
import { setDefaultPage, setDefaultLinks, type DefaultLink } from "@/lib/settings";
import { revalidatePath } from "next/cache";

export async function updateDefaultPage(formData: FormData) {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error("Not authorized");

  const url = (formData.get("defaultPageUrl") as string) ?? "";
  await setDefaultPage(url);

  revalidatePath("/dashboard/admin/settings");
}

export async function updateDefaultLinks(links: DefaultLink[]) {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error("Not authorized");

  await setDefaultLinks(links);
  revalidatePath("/dashboard/admin/settings");
}