import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";
import { API_BASE_URL } from "@/config/constants";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create your account — Lynkr" },
      { name: "description", content: "Create a free Lynkr account to shorten URLs and track clicks." },
      { property: "og:title", content: "Create your account — Lynkr" },
      { property: "og:description", content: "Sign up for Lynkr and start shortening URLs with analytics." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const { setUser, fetchMyLinks } = useStore();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const formattedName = name.trim();
    const formattedEmail = email.trim().toLowerCase();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formattedName, email: formattedEmail, password }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        /* fallback empty object */
      }

      if (res.status === 400 || res.status === 409) {
        const dupMsg = "User already registered! Please log in instead.";
        setErrorMsg(dupMsg);
        toast.warning(dupMsg);
        return;
      }

      if (!res.ok || (data.success !== undefined && !data.success)) {
        const failMsg = data.message || "Registration failed. Please try again.";
        setErrorMsg(failMsg);
        toast.error(failMsg);
        return;
      }

      const token = data.token || data.data?.token;
      const user = data.user || data.data?.user;

      if (token) {
        localStorage.setItem("jwt_token", token);
      }
      setUser({
        name: user?.name || formattedName || "User",
        email: user?.email || formattedEmail,
      });

      toast.success("Account created and saved successfully! Redirecting...");
      await fetchMyLinks();
      navigate({ to: "/links" });
    } catch (err: any) {
      console.error(err);
      const isAbort = err.name === "AbortError";
      const netMsg = isAbort
        ? "Server waking up. Please try clicking Create Account again in 10 seconds."
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
        <p className="eyebrow">GET STARTED</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">Create your account</h1>

        {errorMsg && (
          <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm font-medium text-destructive">
            {errorMsg}
          </div>
        )}

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Lokesh Soni"
            />
          </div>
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
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </form>
        <p className="mt-6 text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-accent hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
