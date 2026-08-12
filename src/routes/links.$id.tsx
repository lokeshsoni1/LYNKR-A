import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BreakdownBars, ClicksChart, StatCard, StatusPill } from "@/components/analytics-widgets";
import { useStore } from "@/lib/store";
import { formatDate, isExpired } from "@/lib/mock-data";
import { API_BASE_URL, formatShortUrl } from "@/config/constants";

export const Route = createFileRoute("/links/$id")({
  head: () => ({
    meta: [
      { title: "Link analytics — Lynkr" },
      { name: "description", content: "Clicks, devices, browsers and referrers for a single Lynkr short link." },
      { property: "og:title", content: "Link analytics — Lynkr" },
      { property: "og:description", content: "Detailed performance for one short link." },
    ],
  }),
  component: LinkDetail,
});

function LinkDetail() {
  const { id } = Route.useParams();
  const { links, fetchMyLinks } = useStore();
  const link = links.find((l) => l.id === id);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);

  useEffect(() => {
    fetchMyLinks();
  }, [fetchMyLinks]);

  useEffect(() => {
    async function fetchAnalytics() {
      const token = localStorage.getItem("jwt_token");
      if (!token || !id) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/urls/${id}/analytics`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            setAnalyticsData(json.data);
          }
        }
      } catch (e) {
        console.error("Failed to fetch link analytics:", e);
      }
    }
    fetchAnalytics();
  }, [id]);

  if (!link) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-24">
        <h1 className="text-2xl font-semibold tracking-tight">Link not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This link may have been deleted or does not belong to your account.
        </p>
        <Button asChild className="mt-6">
          <Link to="/links">Back to My Links</Link>
        </Button>
      </div>
    );
  }

  const expired = isExpired(link);

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <Link to="/links" className="text-sm text-muted-foreground hover:text-foreground">
        ← My Links
      </Link>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <h1 className="font-mono text-2xl font-semibold tracking-tight">
          {formatShortUrl(link.slug)}
        </h1>
        <StatusPill expired={expired} />
      </div>
      <p className="mt-2 max-w-2xl truncate text-sm text-muted-foreground">{link.original}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Created {formatDate(link.createdAt)} · Expires {formatDate(link.expiresAt)}
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="TOTAL CLICKS" value={link.clicks.toLocaleString()} />
        <StatCard label="UNIQUE VISITORS" value={Math.round(link.clicks * 0.7).toLocaleString()} />
        <StatCard label="AVG. CLICKS / DAY" value={Math.max(1, Math.round(link.clicks / 7)).toString()} />
        <StatCard label="STATUS" value={expired ? "Expired" : "Active"} />
      </div>

      <div className="panel mt-6 p-6">
        <p className="eyebrow">CLICK LOGS ({analyticsData.length})</p>
        {analyticsData.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No clicks recorded yet for this short link.</p>
        ) : (
          <ul className="mt-5 divide-y divide-border">
            {analyticsData.map((click: any, i: number) => (
              <li key={i} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <span className="font-mono text-muted-foreground">{click.ipAddress || "Anonymous IP"}</span>
                <span className="text-muted-foreground">
                  {click.referrer || "Direct"} · {click.userAgent || "Unknown Browser"}
                </span>
                <span className="text-xs text-muted-foreground">{formatDate(click.clickedAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
