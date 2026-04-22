import { db } from "@/lib/db";
import { cardViews, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { username, sessionId, event, linkId } = body;

  // Check if the visitor is a logged-in user
  let viewerUserId: string | null = null;
  try {
    const session = await auth();
    if (session?.user?.id) {
      const viewer = await db.query.users.findFirst({
        where: eq(users.ssoSubject, session.user.id),
      });
      viewerUserId = viewer?.id ?? null;
    }
  } catch { /* not logged in */ }

  if (!username || !sessionId) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.username, username),
  });

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  const ua = hdrs.get("user-agent") ?? "";
  const referer = hdrs.get("referer") ?? "";

  const baseValues = {
    userId: user.id,
    sessionId,
    viewerUserId,
    visitorIp: ip,
    userAgent: ua,
    referer,
  };

  if (event === "view") {
    await db.insert(cardViews).values(baseValues);
  } else if (event === "link_click" && linkId) {
    await db.insert(cardViews).values({ ...baseValues, clickedLinkId: linkId });
  } else if (event === "contact_form") {
    await db.insert(cardViews).values({ ...baseValues, filledContactForm: true });
  } else if (event === "vcard_download") {
    await db.insert(cardViews).values({ ...baseValues, downloadedVcard: true });
  }

  return Response.json({ success: true });
}