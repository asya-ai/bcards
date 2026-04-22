import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { cardViews } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { ensureUserExists } from "../actions";
import { ArchiveButton } from "@/components/dashboard/archive-button";

interface GroupedEvent {
  id: string;
  label: string;
  type: "view" | "link_click" | "contact_form" | "vcard_download";
  count: number;
  referer: string;
  viewerName: string | null;
  sessionId: string;
  firstAt: Date;
  lastAt: Date;
}

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const user = await ensureUserExists();

  const views = await db.query.cardViews.findMany({
    where: eq(cardViews.userId, user.id),
    orderBy: [desc(cardViews.createdAt)],
    limit: 500,
    with: {
      clickedLink: true,
    },
  });

  // Resolve viewer names for logged-in visitors
  const viewerIds = [...new Set(views.map((v) => v.viewerUserId).filter(Boolean))] as string[];
  const viewers = viewerIds.length > 0
    ? await db.query.users.findMany({
        where: (u, { inArray }) => inArray(u.id, viewerIds),
      })
    : [];
  const viewerMap = new Map(viewers.map((v) => [v.id, v.displayName]));

  const totalViews = views.filter((v) => !v.clickedLinkId && !v.filledContactForm && !v.downloadedVcard).length;
  const totalLinkClicks = views.filter((v) => v.clickedLinkId).length;
  const totalContactForms = views.filter((v) => v.filledContactForm).length;
  const totalVcardDownloads = views.filter((v) => v.downloadedVcard).length;
  const uniqueSessions = new Set(views.map((v) => v.sessionId)).size;

  // Group consecutive same-type events from same session
  const grouped: GroupedEvent[] = [];
  for (const view of views) {
    const type = view.clickedLinkId ? "link_click" : view.filledContactForm ? "contact_form" : view.downloadedVcard ? "vcard_download" : "view";
    const label = getEventLabel(view);
    const last = grouped[grouped.length - 1];

    if (last && last.sessionId === view.sessionId && last.label === label) {
      last.count++;
      last.lastAt = view.createdAt;
    } else {
      grouped.push({
        id: view.id,
        label,
        type,
        count: 1,
        referer: view.referer ?? "",
        viewerName: view.viewerUserId ? (viewerMap.get(view.viewerUserId) ?? "Team member") : null,
        sessionId: view.sessionId,
        firstAt: view.createdAt,
        lastAt: view.createdAt,
      });
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-font)]">Analytics</h1>
          <p className="mt-1 text-sm text-[var(--color-font)]/60">
            Visitor activity on your card
          </p>
        </div>
        {views.length > 0 && <ArchiveButton />}
      </div>

      {/* Stats grid */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Page Views" value={totalViews} />
        <StatCard label="Unique Visitors" value={uniqueSessions} />
        <StatCard label="Link Clicks" value={totalLinkClicks} />
        <StatCard label="vCard Downloads" value={totalVcardDownloads} />
      </div>

      {totalContactForms > 0 && (
        <div className="mt-4">
          <StatCard label="Contact Forms Filled" value={totalContactForms} />
        </div>
      )}

      {/* Recent activity */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-font)]">Recent Activity</h2>
        {grouped.length === 0 ? (
          <div className="rounded-xl border border-[var(--color-secondary-4)] bg-[var(--color-secondary-2)] p-12 text-center">
            <p className="text-[var(--color-font)]/40">No activity yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {grouped.slice(0, 50).map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between rounded-lg border border-[var(--color-secondary-4)] bg-[var(--color-secondary-2)] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <EventBadge type={event.type} />
                  <div>
                    <p className="text-sm text-[var(--color-font)]">
                      {event.label}
                      {event.count > 1 && (
                        <span className="ml-2 rounded bg-[var(--color-secondary-4)] px-1.5 py-0.5 text-xs text-[var(--color-font)]/60">
                          ×{event.count}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-[var(--color-font)]/30">
                      {event.referer !== "" ? `from ${event.referer}` : "Direct visit"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <time className="text-xs text-[var(--color-font)]/40">
                    {new Date(event.firstAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                  {event.viewerName ? (
                    <p className="text-xs text-[var(--color-primary)]/60">
                      {event.viewerName}
                    </p>
                  ) : (
                    <p className="text-xs text-[var(--color-font)]/20">
                      {event.sessionId.slice(0, 8)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-[var(--color-secondary-4)] bg-[var(--color-secondary-2)] p-4">
      <p className="text-2xl font-bold text-[var(--color-primary)]">{value}</p>
      <p className="mt-1 text-xs text-[var(--color-font)]/60">{label}</p>
    </div>
  );
}

function EventBadge({ type }: { type: string }) {
  if (type === "link_click") {
    return <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-sm text-blue-400">🔗</span>;
  }
  if (type === "contact_form") {
    return <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10 text-sm text-green-400">✉️</span>;
  }
  if (type === "vcard_download") {
    return <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-sm text-purple-400">📇</span>;
  }
  return <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-secondary-4)] text-sm">👁</span>;
}

function getEventLabel(view: { clickedLinkId: string | null; filledContactForm: boolean; downloadedVcard: boolean; clickedLink?: { title: string } | null }) {
  if (view.clickedLinkId && view.clickedLink) {
    return `Clicked: ${view.clickedLink.title}`;
  }
  if (view.clickedLinkId) {
    return "Clicked a link";
  }
  if (view.filledContactForm) {
    return "Submitted contact form";
  }
  if (view.downloadedVcard) {
    return "Downloaded vCard";
  }
  return "Viewed card";
}