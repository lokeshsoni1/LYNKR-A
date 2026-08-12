import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { EXPIRATION_OPTIONS, getExpirationInDays } from "@/lib/mock-data";
import { API_BASE_URL, formatShortUrl } from "@/config/constants";
import { Check, Copy, Link2, Loader2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export function ShortenerCard() {
  const { fetchMyLinks } = useStore();
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [expiration, setExpiration] = useState("never");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setResult(null);
    setErrorMsg(null);

    let wakeToastId: string | number | undefined = undefined;
    const timer = setTimeout(() => {
      wakeToastId = toast.info(
        "Waking up backend server (Render Free Tier takes ~20s for initial start)... Please wait.",
        { duration: 15000 }
      );
    }, 3000);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const token = localStorage.getItem("jwt_token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const payload = {
      originalUrl: url.trim(),
      customAlias: alias.trim() || null,
      expirationInDays: getExpirationInDays(expiration),
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/urls/shorten`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timer);
      clearTimeout(timeoutId);
      if (wakeToastId) toast.dismiss(wakeToastId);

      const data = await res.json();

      if (res.status === 400 || res.status === 409) {
        const errorText = "Custom alias already taken. Try another.";
        setErrorMsg(errorText);
        toast.error(errorText);
        setLoading(false);
        return;
      }

      if (!res.ok || !data.success) {
        const errorText = data.message || "Failed to shorten URL. Please try again.";
        setErrorMsg(errorText);
        toast.error(errorText);
        setLoading(false);
        return;
      }

      const resData = data.data;
      const codeOrAlias = resData.customAlias || resData.shortCode;
      const liveShortUrl = formatShortUrl(codeOrAlias);

      setResult(liveShortUrl);
      setUrl("");
      setAlias("");
      setExpiration("never");
      setCopied(false);
      toast.success("Link Shortened Successfully!");
      fetchMyLinks();
    } catch (err: any) {
      clearTimeout(timer);
      clearTimeout(timeoutId);
      if (wakeToastId) toast.dismiss(wakeToastId);

      console.error(err);
      const isTimeout = err.name === "AbortError";
      const msg = isTimeout
        ? "Server taking too long. Please try again in 10 seconds."
        : "Network error. Could not connect to backend server.";
      
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
    } catch {
      /* ignore */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="panel p-6 shadow-2xl transition-all duration-300 focus-within:border-accent/60 focus-within:ring-2 focus-within:ring-accent/20 sm:p-8">
      <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Link2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste your long URL here..."
            className="h-12 w-full pl-9"
          />
        </div>
        <Button
          type="submit"
          size="lg"
          className="h-12 transition-all duration-200 hover:shadow-[0_0_25px_color-mix(in_oklab,var(--color-primary)_35%,transparent)] active:scale-[0.98] sm:w-40 gap-2"
          disabled={loading}
        >
          {loading && <Loader2 className="size-4 animate-spin" />}
          {loading ? "Shortening..." : "Shorten URL"}
        </Button>
      </form>

      <Accordion type="single" collapsible className="mt-2">
        <AccordionItem value="customize" className="border-b-0">
          <AccordionTrigger className="text-sm text-muted-foreground outline-none hover:text-foreground">
            Customize your link
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-4 pt-1 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="alias">Custom alias</Label>
                <Input
                  id="alias"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  placeholder="my-campaign"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiration">Expiration</Label>
                <Select value={expiration} onValueChange={setExpiration}>
                  <SelectTrigger id="expiration" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPIRATION_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {errorMsg && (
        <div className="mt-4 rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm font-medium text-destructive">
          {errorMsg}
        </div>
      )}

      {result && (
        <div className="mt-4 flex animate-fade-in flex-col gap-3 rounded-xl border border-border bg-secondary/60 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow">Your short link</p>
            <p className="mt-1 font-mono text-base text-foreground">{result}</p>
          </div>
          <Button
            variant="outline"
            onClick={copy}
            className={`gap-2 transition-all duration-200 active:scale-[0.98] sm:w-32 ${
              copied
                ? "scale-105 border-success/30 bg-success/10 text-success"
                : "hover:shadow-[0_0_25px_color-mix(in_oklab,var(--color-primary)_25%,transparent)]"
            }`}
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      )}
    </div>
  );
}
