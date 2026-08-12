import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BreakdownBars, ClicksChart, StatCard } from "@/components/analytics-widgets";
import { useStore } from "@/lib/store";
import { isExpired } from "@/lib/mock-data";
import { API_BASE_URL, formatShortUrl } from "@/config/constants";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Lynkr" },
      { name: "description", content: "Total clicks, unique visitors, devices, browsers and referrers across all your links." },
      { property: "og:title", content: "Analytics — Lynkr" },
      { property: "og:description", content: "See how every Lynkr short link performs in one place." },
    ],
  }),
  component: AnalyticsPage,
});

const DEMO_CLICKS_7D = [
  { label: "Mon", clicks: 12 },
  { label: "Tue", clicks: 28 },
  { label: "Wed", clicks: 19 },
  { label: "Thu", clicks: 35 },
  { label: "Fri", clicks: 42 },
  { label: "Sat", clicks: 24 },
  { label: "Sun", clicks: 30 },
];

const DEMO_CLICKS_30D = Array.from({ length: 30 }, (_, i) => ({
  label: `${i + 1}`,
  clicks: 10 + Math.round(25 * Math.abs(Math.sin(i / 3))),
}));

const DEMO_DEVICES = [
  { label: "Mobile", value: 60 },
  { label: "Desktop", value: 35 },
  { label: "Tablet", value: 5 },
];

const DEMO_BROWSERS = [
  { label: "Chrome", value: 85 },
  { label: "Safari", value: 10 },
  { label: "Firefox", value: 5 },
];

const DEMO_REFERRERS = [
  { label: "Direct", value: 50 },
  { label: "Twitter / X", value: 30 },
  { label: "LinkedIn", value: 20 },
];

const DEMO_ACTIVITY = [
  { slug: "demo-link", device: "Mobile", source: "Direct", time: "5 minutes ago" },
  { slug: "my-launch", device: "Desktop", source: "Twitter / X", time: "20 minutes ago" },
  { slug: "campaign", device: "Mobile", source: "LinkedIn", time: "1 hour ago" },
];

function AnalyticsPage() {
  const { user, links } = useStore();
  const [range, setRange] = useState<"7" | "30">("7");
  const [realAnalytics, setRealAnalytics] = useState<any | null>(null);

  useEffect(() => {
    async function fetchGlobalAnalytics() {
      const token = localStorage.getItem("jwt_token");
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/analytics`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setRealAnalytics(json.data);
          }
        }
      } catch (e) {
        console.error("Failed to fetch global analytics:", e);
      }
    }
    if (user) {
      fetchGlobalAnalytics();
    }
  }, [user]);

  const totalClicks = user
    ? links.reduce((sum, l) => sum + l.clicks, 0)
    : 189;

  const uniqueVisitors = user
    ? Math.round(totalClicks * 0.7)
    : 134;

  const totalLinks = user ? links.length : 3;
  const activeLinks = user ? links.filter((l) => !isExpired(l)).length : 3;

  const clicksData = user ? (range === "7" ? DEMO_CLICKS_7D : DEMO_CLICKS_30D) : (range === "7" ? DEMO_CLICKS_7D : DEMO_CLICKS_30D);
  const devicesData = user && realAnalytics?.devices ? realAnalytics.devices : DEMO_DEVICES;
  const browsersData = user && realAnalytics?.browsers ? realAnalytics.browsers : DEMO_BROWSERS;
  const referrersData = user && realAnalytics?.referrers ? realAnalytics.referrers : DEMO_REFERRERS;

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      {!user && (
        <div className="mb-8 rounded-xl border border-sky-500/30 bg-sky-500/10 p-4 text-sm text-sky-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="font-semibold">🚀 Analytics Preview:</span> Log in or Sign Up to view real-time click metrics, location logs, and device analytics for your links!
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" className="border-sky-500/40 text-sky-100 hover:bg-sky-500/20">
              <Link to="/login">Log in</Link>
            </Button>
            <Button asChild size="sm" className="bg-sky-500 hover:bg-sky-600 text-black font-medium">
              <Link to="/register">Sign Up</Link>
            </Button>
          </div>
        </div>
      )}

      <p className="eyebrow">OVERVIEW</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Analytics</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {user ? "Aggregate performance across every link in your account." : "Preview sample performance metrics and analytics."}
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="TOTAL CLICKS" value={totalClicks.toLocaleString()} />
        <StatCard label="UNIQUE VISITORS" value={uniqueVisitors.toLocaleString()} />
        <StatCard label="TOTAL LINKS" value={totalLinks.toString()} />
        <StatCard label="ACTIVE LINKS" value={activeLinks.toString()} />
      </div>

      <div className="panel mt-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="eyebrow">CLICKS OVER TIME</p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={range === "7" ? "default" : "outline"}
              onClick={() => setRange("7")}
            >
              7 Days
            </Button>
            <Button
              size="sm"
              variant={range === "30" ? "default" : "outline"}
              onClick={() => setRange("30")}
            >
              30 Days
            </Button>
          </div>
        </div>
        <div className="mt-6">
          <ClicksChart data={clicksData} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="panel p-6">
          <p className="eyebrow">DEVICES</p>
          <div className="mt-5">
            <BreakdownBars items={devicesData} />
          </div>
        </div>
        <div className="panel p-6">
          <p className="eyebrow">BROWSERS</p>
          <div className="mt-5">
            <BreakdownBars items={browsersData} />
          </div>
        </div>
        <div className="panel p-6">
          <p className="eyebrow">TRAFFIC SOURCES</p>
          <div className="mt-5">
            <BreakdownBars items={referrersData} />
          </div>
        </div>
      </div>

      <div className="panel mt-6 p-6">
        <p className="eyebrow">RECENT ACTIVITY</p>
        <ul className="mt-5 divide-y divide-border">
          {(user && realAnalytics?.recentActivity ? realAnalytics.recentActivity : DEMO_ACTIVITY).map((a: any, i: number) => (
            <li key={i} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
              <span className="font-mono text-muted-foreground">{formatShortUrl(a.slug)}</span>
              <span className="text-muted-foreground">
                {a.device} · {a.source}
              </span>
              <span className="text-xs text-muted-foreground">{a.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
