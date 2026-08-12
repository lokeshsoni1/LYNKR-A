import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";
import { API_BASE_URL } from "@/config/constants";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — Lynkr" },
      { name: "description", content: "Log in to your Lynkr account to manage short links and analytics." },
      { property: "og:title", content: "Log in — Lynkr" },
      { property: "og:description", content: "Access your Lynkr short links and click analytics." },
    ],
  }),
  component: LoginPage,
});

export function GoogleIcon() {
  return (
    <svg className="size-5 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function LoginPage() {
  const { setUser, fetchMyLinks } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.status === 401 || res.status === 400 || !res.ok || !data.success) {
        const msg = res.status === 401 ? "Invalid email or password. Please try again." : (data.message || "Invalid email or password. Please try again.");
        setErrorMsg(msg);
        toast.error(msg);
        setLoading(false);
        return;
      }

      const token = data.token || data.data?.token;
      const user = data.user || data.data?.user;

      if (token) {
        localStorage.setItem("jwt_token", token);
      }
      setUser({
        name: user?.name || email.split("@")[0] || "User",
        email: user?.email || email,
      });

      await fetchMyLinks();
      navigate({ to: "/links" });
    } catch (err) {
      console.error(err);
      const netMsg = "Network error. Could not connect to backend server.";
      setErrorMsg(netMsg);
      toast.error(netMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      toast.info("Google Auth requires VITE_GOOGLE_CLIENT_ID in env. Please use Email/Password login or configure Google Client ID.");
      return;
    }
    const redirectUri = encodeURIComponent(window.location.origin + "/login");
    const scope = encodeURIComponent("email profile");
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}`;
    window.location.href = googleAuthUrl;
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-6 py-16">
      <div className="panel w-full p-8">
        <p className="eyebrow">WELCOME BACK</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">Log in to Lynkr</h1>

        {errorMsg && (
          <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm font-medium text-destructive">
            {errorMsg}
          </div>
        )}

        <div className="mt-6 space-y-4">
          <Button
            type="button"
            variant="outline"
            className="w-full gap-3 h-11 border-border/80 hover:bg-secondary/60"
            onClick={handleGoogleAuth}
          >
            <GoogleIcon />
            Continue with Google
          </Button>

          <div className="relative flex items-center justify-center">
            <span className="absolute bg-card px-3 text-xs text-muted-foreground uppercase tracking-wider">
              Or continue with email
            </span>
            <div className="w-full border-t border-border/60" />
          </div>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
        <p className="mt-6 text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/register" className="text-accent hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
