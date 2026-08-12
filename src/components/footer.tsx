import { Link } from "@tanstack/react-router";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/links", label: "My Links" },
  { to: "/analytics", label: "Analytics" },
] as const;

export function Footer() {
  return (
    <footer className="mt-8 border-t border-border/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-sm font-semibold tracking-[0.24em]">LYNKR</span>
          <p className="mt-2 text-sm text-muted-foreground">Shorten. Track. Understand.</p>
        </div>

        <nav className="flex gap-7 text-sm text-muted-foreground">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="outline-none transition-colors hover:text-foreground focus-visible:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Lynkr. Designed &amp; Developed by{" "}
          <span className="bg-gradient-to-r from-accent to-primary bg-clip-text font-medium text-transparent">
            Lokesh Soni
          </span>
          .
        </p>
      </div>
    </footer>
  );
}
