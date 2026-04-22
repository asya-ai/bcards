import { readFile } from "fs/promises";
import { join } from "path";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest, ctx: RouteContext<"/api/avatar/[...path]">) {
  const { path } = await ctx.params;
  const filePath = Array.isArray(path) ? path.join("/") : path;

  // Local upload
  if (!filePath.startsWith("http")) {
    try {
      const fullPath = join(process.cwd(), "public", "uploads", filePath);
      const buffer = await readFile(fullPath);
      const ext = filePath.split(".").pop()?.toLowerCase() ?? "jpg";
      const contentType =
        ext === "png" ? "image/png" :
        ext === "webp" ? "image/webp" :
        ext === "gif" ? "image/gif" :
        "image/jpeg";

      return new Response(buffer, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch {
      return new Response("Not found", { status: 404 });
    }
  }

  // External URL — proxy and cache
  try {
    const url = decodeURIComponent(filePath);
    const res = await fetch(url);
    if (!res.ok) return new Response("Not found", { status: 404 });

    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get("Content-Type") ?? "image/jpeg";

    return new Response(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new Response("Failed to fetch", { status: 502 });
  }
}