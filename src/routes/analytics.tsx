import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BreakdownBars, ClicksChart, StatCard } from "@/components/analytics-widgets";
import { useStore } from "@/lib/store";
import {
  BROWSERS,
  CLICKS_30D,
  CLICKS_7D,
  DEVICES,
  RECENT_ACTIVITY,
  REFERRERS,
  isExpired,
} from "@/lib/mock-data";

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

function AnalyticsPage() {
  const { links } = useStore();
  const [range, setRange] = useState<"7" | "30">("7");

  const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0);
  const activeLinks = links.filter((l) => !isExpired(l)).length;

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <p className="eyebrow">OVERVIEW</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Analytics</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Aggregate performance across every link in your account.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="TOTAL CLICKS" value={totalClicks.toLocaleString()} />
        <StatCard label="UNIQUE VISITORS" value={Math.round(totalClicks * 0.69).toLocaleString()} />
        <StatCard label="TOTAL LINKS" value={links.length.toString()} />
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
          <ClicksChart data={range === "7" ? CLICKS_7D : CLICKS_30D} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="panel p-6">
          <p className="eyebrow">DEVICES</p>
          <div className="mt-5">
            <BreakdownBars items={DEVICES} />
          </div>
        </div>
        <div className="panel p-6">
          <p className="eyebrow">BROWSERS</p>
          <div className="mt-5">
            <BreakdownBars items={BROWSERS} />
          </div>
        </div>
        <div className="panel p-6">
          <p className="eyebrow">TRAFFIC SOURCES</p>
          <div className="mt-5">
            <BreakdownBars items={REFERRERS} />
          </div>
        </div>
      </div>

      <div className="panel mt-6 p-6">
        <p className="eyebrow">RECENT ACTIVITY</p>
        <ul className="mt-5 divide-y divide-border">
          {RECENT_ACTIVITY.map((a, i) => (
            <li key={i} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
              <span className="font-mono text-muted-foreground">lynkr.ly/{a.slug}</span>
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
