import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateVCard } from "@/lib/vcard";
import type { NextRequest } from "next/server";

export async function GET(_req: NextRequest, ctx: RouteContext<"/[username]/vcard">) {
  const { username } = await ctx.params;

  const user = await db.query.users.findFirst({
    where: eq(users.username, username),
  });

  if (!user) {
    return new Response("Not found", { status: 404 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://bcard.asya.ai";

  const vcard = generateVCard({
    displayName: user.displayName,
    jobTitle: user.jobTitle ?? undefined,
    company: user.company ?? undefined,
    email: user.email ?? undefined,
    phone: user.phone ?? undefined,
    url: `${appUrl}/${user.username}`,
    bio: user.bio ?? undefined,
  });

  return new Response(vcard, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${user.username}.vcf"`,
    },
  });
}