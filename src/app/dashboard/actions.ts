"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

import { users, links, cardViews } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDefaultLinks } from "@/lib/settings";

export async function ensureUserExists() {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  let user = await db.query.users.findFirst({
    where: eq(users.ssoSubject, session.user.id),
  });

  if (!user) {
    const username = (session.user.name ?? session.user.email ?? "user")
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, ".")
      .replace(/\.{2,}/g, ".")
      .replace(/^\.+|\.+$/g, "");

    const [newUser] = await db
      .insert(users)
      .values({
        ssoSubject: session.user.id,
        username,
        displayName: session.user.name ?? "User",
        email: session.user.email ?? "",
      })
      .returning();
    user = newUser;

    // Add default links for new users
    const defaultLinks = await getDefaultLinks();
    if (defaultLinks.length > 0) {
      await db.insert(links).values(
        defaultLinks.map((link, index) => ({
          userId: user!.id,
          title: link.title,
          url: link.url,
          sortOrder: index,
        }))
      );
    }
  }

  return user;
}

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  const user = await ensureUserExists();

  await db
    .update(users)
    .set({
      displayName: (formData.get("displayName") as string) || user.displayName,
      jobTitle: formData.get("jobTitle") as string,
      company: formData.get("company") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      bio: formData.get("bio") as string,
      avatarUrl: formData.get("avatarUrl") as string,
      redirectUrl: formData.get("redirectUrl") as string,
      contactFormEnabled: formData.get("contactFormEnabled") === "on",
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  revalidatePath("/dashboard");
  revalidatePath(`/${user.username}`);
}

export async function updateProfileForUser(userId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error("Not authorized");

  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) throw new Error("User not found");

  await db
    .update(users)
    .set({
      displayName: (formData.get("displayName") as string) || user.displayName,
      jobTitle: formData.get("jobTitle") as string,
      company: formData.get("company") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      bio: formData.get("bio") as string,
      avatarUrl: formData.get("avatarUrl") as string,
      redirectUrl: formData.get("redirectUrl") as string,
      contactFormEnabled: formData.get("contactFormEnabled") === "on",
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  revalidatePath("/dashboard/admin");
  revalidatePath(`/${user.username}`);
}

export async function addLink(formData: FormData) {
  const user = await ensureUserExists();

  const existingLinks = await db.query.links.findMany({
    where: eq(links.userId, user.id),
  });

  await db.insert(links).values({
    userId: user.id,
    title: formData.get("title") as string,
    url: formData.get("url") as string,
    icon: formData.get("icon") as string,
    sortOrder: existingLinks.length,
  });

  revalidatePath("/dashboard");
  revalidatePath(`/${user.username}`);
}

export async function updateLink(linkId: string, formData: FormData) {
  const user = await ensureUserExists();

  await db
    .update(links)
    .set({
      title: formData.get("title") as string,
      url: formData.get("url") as string,
      icon: formData.get("icon") as string,
      updatedAt: new Date(),
    })
    .where(and(eq(links.id, linkId), eq(links.userId, user.id)));

  revalidatePath("/dashboard");
  revalidatePath(`/${user.username}`);
}

export async function deleteLink(linkId: string) {
  const user = await ensureUserExists();

  await db
    .delete(links)
    .where(and(eq(links.id, linkId), eq(links.userId, user.id)));

  revalidatePath("/dashboard");
  revalidatePath(`/${user.username}`);
}

export async function reorderLinks(linkIds: string[]) {
  const user = await ensureUserExists();

  await Promise.all(
    linkIds.map((id, index) =>
      db
        .update(links)
        .set({ sortOrder: index, updatedAt: new Date() })
        .where(and(eq(links.id, id), eq(links.userId, user.id)))
    )
  );

  revalidatePath("/dashboard");
  revalidatePath(`/${user.username}`);
}

export async function clearAnalytics() {
  const user = await ensureUserExists();

  await db.delete(cardViews).where(eq(cardViews.userId, user.id));

  revalidatePath("/dashboard/analytics");
}

export async function deleteUser(userId: string) {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error("Not authorized");

  await db.delete(users).where(eq(users.id, userId));
  revalidatePath("/dashboard/admin");
}