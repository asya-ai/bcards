import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { CardPage } from "@/components/card/card-page";
import { Tracker } from "@/components/card/tracker";
import { getDefaultPage } from "@/lib/settings";

export async function generateMetadata(props: PageProps<"/[username]">): Promise<Metadata> {
  const { username } = await props.params;

  const user = await db.query.users.findFirst({
    where: eq(users.username, username),
    columns: { displayName: true },
  });

  return {
    title: user?.displayName ?? "Asya business cards",
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