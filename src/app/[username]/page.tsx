import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { CardPage } from "@/components/card/card-page";
import { Tracker } from "@/components/card/tracker";
import { getDefaultPage } from "@/lib/settings";

function toShareAvatarUrl(avatarUrl: string | null): string | null {
  if (!avatarUrl) return null;

  if (avatarUrl.startsWith("/api/avatar/")) return avatarUrl;

  if (avatarUrl.startsWith("/uploads/")) {
    return `/api/avatar/${avatarUrl.replace("/uploads/", "")}`;
  }

  if (avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://")) {
    return `/api/avatar/${encodeURIComponent(avatarUrl)}`;
  }

  return null;
}

export async function generateMetadata(props: PageProps<"/[username]">): Promise<Metadata> {
  const { username } = await props.params;

  const user = await db.query.users.findFirst({
    where: eq(users.username, username),
    columns: { username: true, displayName: true, avatarUrl: true },
  });

  if (!user) {
    return {
      title: "Asya business cards",
    };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://bcard.asya.ai";
  const normalizedAppUrl = appUrl.endsWith("/") ? appUrl.slice(0, -1) : appUrl;
  const shareAvatar = toShareAvatarUrl(user.avatarUrl);
  const imageUrl = shareAvatar ? `${normalizedAppUrl}${shareAvatar}` : undefined;

  return {
    title: user.displayName,
    openGraph: {
      title: user.displayName,
      url: `${normalizedAppUrl}/${user.username}`,
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title: user.displayName,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function PublicCardPage(props: PageProps<"/[username]">) {
  const { username } = await props.params;

  const user = await db.query.users.findFirst({
    where: eq(users.username, username),
    with: { links: { orderBy: (l, { asc }) => [asc(l.sortOrder)] } },
  });

  if (!user) {
    const defaultPage = await getDefaultPage();
    if (defaultPage) {
      redirect(defaultPage);
    }
    notFound();
  }

  if (user.redirectUrl) {
    redirect(user.redirectUrl);
  }

  return (
    <Tracker username={user.username}>
      <CardPage user={user} links={user.links} />
    </Tracker>
  );
}