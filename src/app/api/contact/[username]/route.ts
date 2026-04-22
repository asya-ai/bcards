import { db } from "@/lib/db";
import { users, contactSubmissions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest, ctx: RouteContext<"/api/contact/[username]">) {
  const { username } = await ctx.params;

  const user = await db.query.users.findFirst({
    where: eq(users.username, username),
  });

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  if (!user.contactFormEnabled) {
    return Response.json({ error: "Contact form is disabled" }, { status: 403 });
  }

  const body = await req.json();
  const { name, email, message } = body;

  if (!name || !email || !message) {
    return Response.json({ error: "All fields are required" }, { status: 400 });
  }

  await db.insert(contactSubmissions).values({
    userId: user.id,
    name,
    email,
    message,
  });

  return Response.json({ success: true });
}