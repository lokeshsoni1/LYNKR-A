import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStore } from "@/lib/store";
import { Menu } from "lucide-react";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/links", label: "My Links" },
  { to: "/analytics", label: "Analytics" },
] as const;

const linkBase =
  "rounded-lg px-3 py-1.5 text-sm outline-none transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-secondary/60 focus-visible:text-foreground";
const linkActive =
  "bg-secondary/90 text-foreground font-medium border border-border/80 shadow-inner";

export function Navbar() {
  const { user, logout } = useStore();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          to="/"
          className="text-sm font-semibold tracking-[0.24em] text-foreground outline-none"
        >
          LYNKR
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className={linkBase}
              activeProps={{ className: linkActive }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                    {user.name.slice(0, 1).toUpperCase()}
                  </span>
                  {user.name}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="font-normal">
                  <p className="text-sm text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/links">My Links</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/analytics">Analytics</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button asChild variant="outline" size="sm">
                <Link to="/login">Login</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="transition-all duration-200 hover:shadow-[0_0_25px_color-mix(in_oklab,var(--color-primary)_35%,transparent)] active:scale-[0.98]"
              >
                <Link to="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="text-muted-foreground outline-none md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation"
        >
          <Menu className="size-5" />
        </button>
      </div>

      {open && (
        <div className="border-t border-border/60 px-6 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                onClick={() => setOpen(false)}
                className={linkBase}
                activeProps={{ className: linkActive }}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex gap-3 pt-3">
              {user ? (
                <Button variant="outline" size="sm" onClick={logout}>
                  Logout
                </Button>
              ) : (
                <>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link to="/register">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
