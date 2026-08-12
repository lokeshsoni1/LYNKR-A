import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value?: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover/95 px-3 py-2 shadow-xl backdrop-blur-sm">
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium tabular-nums text-foreground">
        {payload[0]?.value?.toLocaleString()} clicks
      </p>
    </div>
  );
}

export function ClicksChart({
  data,
}: {
  data: { label: string; clicks: number }[];
}) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            stroke="var(--muted-foreground)"
            fontSize={11}
            interval="preserveStartEnd"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            stroke="var(--muted-foreground)"
            fontSize={11}
            width={44}
          />
          <Tooltip
            cursor={{ stroke: "var(--border)" }}
            content={<ChartTooltip />}
          />
          <Line
            type="monotone"
            dataKey="clicks"
            stroke="var(--accent)"
            strokeWidth={2}
            dot={false}
            activeDot={{
              r: 4,
              fill: "var(--accent)",
              stroke: "var(--accent)",
              strokeOpacity: 0.25,
              strokeWidth: 8,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BreakdownBars({
  items,
}: {
  items: { label: string; value: number }[];
}) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.label} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{item.label}</span>
            <span className="text-foreground tabular-nums">{item.value}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div className="bar-fill h-2" style={{ width: `${item.value}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="group panel relative overflow-hidden p-6 transition-all duration-300 hover:border-border">
      <span className="absolute inset-x-0 top-0 h-px scale-x-0 bg-gradient-to-r from-accent to-primary transition-transform duration-300 group-hover:scale-x-100" />
      <p className="eyebrow">{label}</p>
      <p className="mt-3 text-3xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function StatusPill({ expired }: { expired: boolean }) {
  if (expired) {
    return (
      <span className="status-pill border border-destructive/25 bg-destructive/10 text-destructive">
        EXPIRED
      </span>
    );
  }
  return (
    <span className="status-pill border border-success/25 bg-success/10 text-success">
      <span className="inline-block size-2 animate-pulse rounded-full bg-success" />
      ACTIVE
    </span>
  );
}
