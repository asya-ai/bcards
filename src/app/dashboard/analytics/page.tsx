import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { analyticsDividers, cardViews } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { addAnalyticsDivider, ensureUserExists } from "../actions";
import { ArchiveButton } from "@/components/dashboard/archive-button";
import { AnalyticsDividerForm } from "@/components/dashboard/analytics-divider-form";
import { LocalTime } from "@/components/dashboard/local-time";

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

interface DividerEvent {
  id: string;
  title: string;
  eventAt: Date;
  visitsInPeriod: number;
}

type TimelineItem =
  | { id: string; kind: "event"; at: Date; event: GroupedEvent }
  | { id: string; kind: "divider"; at: Date; divider: DividerEvent };

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const user = await ensureUserExists();

  const [views, dividersRaw] = await Promise.all([
    db.query.cardViews.findMany({
      where: eq(cardViews.userId, user.id),
      orderBy: [desc(cardViews.createdAt)],
      limit: 500,
      with: {
        clickedLink: true,
      },
    }),
    db.query.analyticsDividers.findMany({
      where: eq(analyticsDividers.userId, user.id),
      orderBy: [desc(analyticsDividers.eventAt)],
      limit: 200,
    }),
  ]);

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

  const dividers: DividerEvent[] = dividersRaw.map((divider, index) => {
    const newerDivider = index > 0 ? dividersRaw[index - 1] : null;
    const visitsInPeriod = views.filter((view) => {
      const isAfterDivider = view.createdAt >= divider.eventAt;
      const isBeforeNewerDivider = newerDivider ? view.createdAt < newerDivider.eventAt : true;
      return isAfterDivider && isBeforeNewerDivider;
    }).length;

    return {
      id: divider.id,
      title: divider.title,
      eventAt: divider.eventAt,
      visitsInPeriod,
    };
  });

  const timeline: TimelineItem[] = [
    ...grouped.map((event) => ({
      id: `event-${event.id}`,
      kind: "event" as const,
      at: event.firstAt,
      event,
    })),
    ...dividers.map((divider) => ({
      id: `divider-${divider.id}`,
      kind: "divider" as const,
      at: divider.eventAt,
      divider,
    })),
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 80);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-font)]">Analytics</h1>
          <p className="mt-1 text-sm text-[var(--color-font)]/60">
            Visitor activity on your card
          </p>
        </div>
        {(views.length > 0 || dividers.length > 0) && <ArchiveButton />}
      </div>

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

      <div className="mt-8 rounded-xl border border-[var(--color-secondary-4)] bg-[var(--color-secondary-2)] p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-[var(--color-font)]">Add Divider Event</h2>
        <p className="mt-1 text-sm text-[var(--color-font)]/60">
          Mark campaigns, launches, or posts and compare visits between divider events.
        </p>
        <AnalyticsDividerForm action={addAnalyticsDivider} />
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-font)]">Recent Activity</h2>
        {timeline.length === 0 ? (
          <div className="rounded-xl border border-[var(--color-secondary-4)] bg-[var(--color-secondary-2)] p-12 text-center">
            <p className="text-[var(--color-font)]/40">No activity yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {timeline.map((item) =>
              item.kind === "divider" ? (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-[var(--color-primary)]/40 bg-[var(--color-primary)]/8 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <DividerBadge />
                    <div>
                      <p className="text-sm font-medium text-[var(--color-font)]">{item.divider.title}</p>
                      <p className="text-xs text-[var(--color-font)]/60">
                        {item.divider.visitsInPeriod} visits in this period
                      </p>
                    </div>
                  </div>
                  <LocalTime
                    dateTime={item.divider.eventAt.toISOString()}
                    className="text-xs text-[var(--color-font)]/50"
                  />
                </div>
              ) : (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-[var(--color-secondary-4)] bg-[var(--color-secondary-2)] px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <EventBadge type={item.event.type} />
                    <div>
                      <p className="text-sm text-[var(--color-font)]">
                        {item.event.label}
                        {item.event.count > 1 && (
                          <span className="ml-2 rounded bg-[var(--color-secondary-4)] px-1.5 py-0.5 text-xs text-[var(--color-font)]/60">
                            ×{item.event.count}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-[var(--color-font)]/30">
                        {item.event.referer !== "" ? `from ${item.event.referer}` : "Direct visit"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <LocalTime
                      dateTime={item.event.firstAt.toISOString()}
                      className="text-xs text-[var(--color-font)]/40"
                    />
                    {item.event.viewerName ? (
                      <p className="text-xs text-[var(--color-primary)]/60">{item.event.viewerName}</p>
                    ) : (
                      <p className="text-xs text-[var(--color-font)]/20">{item.event.sessionId.slice(0, 8)}</p>
                    )}
                  </div>
                </div>
              )
            )}
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

function DividerBadge() {
  return <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)]/20 text-sm text-[var(--color-primary)]">📌</span>;
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