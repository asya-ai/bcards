import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getSetting(key: string): Promise<string | null> {
  const row = await db.query.siteSettings.findFirst({
    where: eq(siteSettings.key, key),
  });
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await db
    .insert(siteSettings)
    .values({ key, value })
    .onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedAt: new Date() } });
}

export async function getDefaultPage(): Promise<string | null> {
  return getSetting("default_page_url");
}

export async function setDefaultPage(url: string): Promise<void> {
  return setSetting("default_page_url", url);
}

export interface DefaultLink {
  title: string;
  url: string;
}

export async function getDefaultLinks(): Promise<DefaultLink[]> {
  const raw = await getSetting("default_links");
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function setDefaultLinks(links: DefaultLink[]): Promise<void> {
  return setSetting("default_links", JSON.stringify(links));
}