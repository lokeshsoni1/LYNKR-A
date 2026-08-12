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

    const formattedEmail = email.trim().toLowerCase();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formattedEmail, password }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        /* fallback empty object */
      }

      if (res.ok && (data.success || data.token || data.data?.token)) {
        const token = data.token || data.data?.token;
        const user = data.user || data.data?.user;

        if (token) {
          localStorage.setItem("jwt_token", token);
        }
        setUser({
          name: user?.name || formattedEmail.split("@")[0] || "User",
          email: user?.email || formattedEmail,
        });

        toast.success("Login successful!");
        await fetchMyLinks();
        navigate({ to: "/links" });
        return;
      }

      if (res.status === 404 || (res.status === 400 && data.message?.toLowerCase().includes("user"))) {
        const notFoundText = "User does not exist. Please register first!";
        setErrorMsg(notFoundText);
        toast.error(notFoundText);
        return;
      }

      if (res.status === 401) {
        const invalidText = "Invalid email or password.";
        setErrorMsg(invalidText);
        toast.error(invalidText);
        return;
      }

      const failMsg = data.message || "Invalid email or password.";
      setErrorMsg(failMsg);
      toast.error(failMsg);
    } catch (err: any) {
      console.error(err);
      const isAbort = err.name === "AbortError";
      const netMsg = isAbort
        ? "Server waking up. Please try clicking Login again in 10 seconds."
        : "Network error. Could not connect to backend server.";
      setErrorMsg(netMsg);
      toast.error(netMsg);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
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
