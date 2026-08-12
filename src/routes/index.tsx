import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ShortenerCard } from "@/components/shortener-card";
import { BreakdownBars, ClicksChart, StatCard } from "@/components/analytics-widgets";
import { CLICKS_7D, DEVICES } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lynkr — Shorten, track and understand your links" },
      {
        name: "description",
        content:
          "Lynkr turns long URLs into simple, shareable short links with custom aliases, expiration and click analytics.",
      },
      { property: "og:title", content: "Lynkr — Shorten, track and understand your links" },
      {
        property: "og:description",
        content:
          "Lynkr turns long URLs into simple, shareable short links with custom aliases, expiration and click analytics.",
      },
    ],
  }),
  component: Index,
});

const BENEFITS = [
  {
    title: "FAST REDIRECTS",
    body: "Links resolve in milliseconds from the edge, so visitors never wait on a hop.",
  },
  {
    title: "CUSTOM LINKS",
    body: "Replace random characters with a readable alias that matches your campaign.",
  },
  {
    title: "BASIC ANALYTICS",
    body: "See clicks, unique visitors, devices and sources without a dashboard maze.",
  },
];

const STEPS = [
  {
    step: "STEP 01",
    title: "CREATE",
    body: "Paste a long URL, optionally set a custom alias and an expiration window.",
  },
  {
    step: "STEP 02",
    title: "SHARE",
    body: "Copy your short link and drop it into posts, emails, decks or docs.",
  },
  {
    step: "STEP 03",
    title: "ANALYZE",
    body: "Watch clicks land in real time and understand where traffic comes from.",
  },
];

const FEATURES = [
  { n: "01", title: "URL Shortening", body: "Compress any long link into a short, clean address." },
  { n: "02", title: "Fast URL Redirect", body: "Low-latency redirects that keep the click experience instant." },
  { n: "03", title: "Easy Copy", body: "One-tap copy with clear confirmation feedback." },
  { n: "04", title: "Click Counter", body: "Every visit is counted and attributed to the right link." },
  { n: "05", title: "Custom Alias", body: "Pick your own slug for memorable, branded links." },
  { n: "06", title: "Link Expiration", body: "Set links to expire after an hour, a week or never." },
  { n: "07", title: "Basic Analytics", body: "Devices, browsers, referrers and clicks over time." },
  { n: "08", title: "User Authentication", body: "Keep your links private to your own account." },
];

function Index() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-16 sm:pt-28">
        <p className="eyebrow">SHORTEN. TRACK. UNDERSTAND.</p>
        <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
          Turn long URLs into simple, shareable links.
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Lynkr gives you short links you can actually read, with custom aliases,
          expiration control and the click analytics that matter — nothing else.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Button
            asChild
            size="lg"
            className="transition-all duration-200 hover:shadow-[0_0_25px_color-mix(in_oklab,var(--color-primary)_35%,transparent)] active:scale-[0.98]"
          >
            <a href="#shorten">Shorten a URL</a>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/register">Get Started</Link>
          </Button>
        </div>
      </section>

      {/* Shortener */}
      <section id="shorten" className="mx-auto max-w-4xl px-6 pb-24 scroll-mt-24">
        <ShortenerCard />
      </section>

      {/* Benefits */}
      <section className="border-t border-border">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 sm:grid-cols-3">
          {BENEFITS.map((b) => (
            <div key={b.title} className="panel panel-hover p-6">
              <p className="eyebrow">{b.title}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="eyebrow">HOW IT WORKS</p>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
            Three steps, start to insight.
          </h2>
          <div className="mt-12 divide-y divide-border border-y border-border">
            {STEPS.map((s) => (
              <div key={s.step} className="grid gap-4 py-8 sm:grid-cols-[160px_1fr]">
                <p className="eyebrow pt-1">{s.step}</p>
                <div>
                  <h3 className="text-lg font-medium tracking-tight">{s.title}</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    {s.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="eyebrow">FEATURE OVERVIEW</p>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
            Everything a link needs. Nothing it doesn't.
          </h2>
          <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div key={f.n} className="bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-card/60">
                <p className="font-mono text-sm tracking-wider text-accent">{f.n}</p>
                <h3 className="mt-3 text-sm font-medium">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Analytics preview */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="eyebrow">ANALYTICS PREVIEW</p>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
            Readable numbers, at a glance.
          </h2>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            <div className="grid gap-6">
              <StatCard label="TOTAL CLICKS" value="2,481" hint="Last 7 days" />
              <StatCard label="UNIQUE VISITORS" value="1,721" hint="Last 7 days" />
            </div>
            <div className="panel p-6 lg:col-span-2">
              <p className="eyebrow">CLICKS OVER TIME</p>
              <div className="mt-4">
                <ClicksChart data={CLICKS_7D} />
              </div>
            </div>
          </div>
          <div className="panel mt-6 p-6">
            <p className="eyebrow">DEVICES</p>
            <div className="mt-5 max-w-xl">
              <BreakdownBars items={DEVICES} />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-24">
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Start shortening in under a minute.
          </h2>
          <p className="max-w-xl text-muted-foreground">
            Create an account, paste a URL and share it. Your analytics start the
            moment someone clicks.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/register">Get Started</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/links">View My Links</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
