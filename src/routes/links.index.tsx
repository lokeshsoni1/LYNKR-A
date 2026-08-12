import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStore } from "@/lib/store";
import {
  EXPIRATION_OPTIONS,
  formatDate,
  getExpirationInDays,
  isExpired,
  type LinkRecord,
} from "@/lib/mock-data";
import { API_BASE_URL, formatShortUrl } from "@/config/constants";
import { BarChart3, Check, Copy, Search, Trash2 } from "lucide-react";
import { StatusPill } from "@/components/analytics-widgets";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

export const Route = createFileRoute("/links/")({
  head: () => ({
    meta: [
      { title: "My Links — Lynkr" },
      { name: "description", content: "Manage every short link you've created: clicks, expiration and status." },
      { property: "og:title", content: "My Links — Lynkr" },
      { property: "og:description", content: "Search, create and manage your Lynkr short links." },
    ],
  }),
  component: LinksPage,
});

function LinksPage() {
  const { links, user, fetchMyLinks, deleteLink, addGuestLink, addCreatedLink } = useStore();
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [toDelete, setToDelete] = useState<LinkRecord | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [original, setOriginal] = useState("");
  const [alias, setAlias] = useState("");
  const [expiration, setExpiration] = useState("never");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchMyLinks();
  }, [fetchMyLinks]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return links;
    return links.filter(
      (l) => l.slug.toLowerCase().includes(q) || l.original.toLowerCase().includes(q),
    );
  }, [links, query]);

  const copy = async (link: LinkRecord) => {
    try {
      await navigator.clipboard.writeText(formatShortUrl(link.slug));
    } catch {
      /* ignore */
    }
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!original.trim()) return;

    if (links.length >= 10) {
      const limitText = "Link Limit Reached: You can only store up to 10 links per account to optimize storage. Delete old links to create new ones.";
      setErrorMsg(limitText);
      toast.error(limitText);
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const token = localStorage.getItem("jwt_token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const payload = {
      originalUrl: original.trim(),
      customAlias: alias.trim() || null,
      expirationInDays: getExpirationInDays(expiration),
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/urls/shorten`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.status === 400 || res.status === 409) {
        const errorText = "Custom alias already taken. Try another.";
        setErrorMsg(errorText);
        toast.error(errorText);
        setLoading(false);
        return;
      }

      if (!res.ok || !data.success) {
        const errorText = data.message || "Failed to create short link.";
        setErrorMsg(errorText);
        toast.error(errorText);
        setLoading(false);
        return;
      }

      const resData = data.data;
      const codeOrAlias = resData.customAlias || resData.shortCode;

      const newRecord = {
        id: String(resData.id || Date.now()),
        slug: codeOrAlias,
        original: resData.originalUrl || original.trim(),
        clicks: resData.clickCount || 0,
        createdAt: resData.createdAt || new Date().toISOString(),
        expiresAt: resData.expiresAt || null,
      };

      if (!token) {
        addGuestLink(newRecord);
      } else {
        addCreatedLink(newRecord);
      }

      setOriginal("");
      setAlias("");
      setExpiration("never");
      setCreateOpen(false);
      toast.success("Link Shortened Successfully!");
      if (token) fetchMyLinks();
    } catch (err) {
      console.error(err);
      const netErr = "Network error. Could not connect to backend server.";
      setErrorMsg(netErr);
      toast.error(netErr);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      {!user && (
        <div className="mb-8 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="font-semibold">⚠️ Guest Mode:</span> Log in or Register to save your links permanently in database.
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" className="border-amber-500/40 text-amber-100 hover:bg-amber-500/20">
              <Link to="/login">Log in</Link>
            </Button>
            <Button asChild size="sm" className="bg-amber-500 hover:bg-amber-600 text-black font-medium">
              <Link to="/register">Register</Link>
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">DASHBOARD</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">My Links</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {links.length} / 10 links total · {links.filter((l) => !isExpired(l)).length} active
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>Create Short Link</Button>
      </div>

      <div className="relative mt-8 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search links..."
          className="pl-9 transition-all duration-200 focus-visible:border-accent/60 focus-visible:ring-2 focus-visible:ring-accent/30"
        />
      </div>

      <div className="panel mt-6 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Short URL</TableHead>
              <TableHead>Original URL</TableHead>
              <TableHead className="text-right">Clicks</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Expiration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                  No links found. Create your first short link above!
                </TableCell>
              </TableRow>
            )}
            {filtered.map((link) => {
              const expired = isExpired(link);
              return (
                <TableRow key={link.id} className="transition-colors hover:bg-secondary/40">
                  <TableCell className="font-mono text-sm">{formatShortUrl(link.slug)}</TableCell>
                  <TableCell className="max-w-[260px] truncate text-sm text-muted-foreground">
                    {link.original}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {link.clicks.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(link.createdAt)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(link.expiresAt)}
                  </TableCell>
                  <TableCell>
                    <StatusPill expired={expired} />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <TooltipProvider delayDuration={150}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => copy(link)}
                              aria-label="Copy"
                              className="transition-transform duration-200 hover:scale-110 active:scale-95"
                            >
                              {copiedId === link.id ? (
                                <Check className="size-4 text-success" />
                              ) : (
                                <Copy className="size-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Copy short link</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                              aria-label="Analytics"
                              className="transition-transform duration-200 hover:scale-110 active:scale-95"
                            >
                              <Link to="/links/$id" params={{ id: link.id }}>
                                <BarChart3 className="size-4" />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View analytics</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setToDelete(link)}
                              aria-label="Delete"
                              className="transition-transform duration-200 hover:scale-110 hover:text-destructive active:scale-95"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete link</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create short link</DialogTitle>
            <DialogDescription>
              Paste a destination URL and optionally set an alias and expiration.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-5" onSubmit={handleCreate}>
            {errorMsg && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm font-medium text-destructive">
                {errorMsg}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="destination">Destination URL</Label>
              <Input
                id="destination"
                required
                value={original}
                onChange={(e) => setOriginal(e.target.value)}
                placeholder="https://example.com/very/long/path"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="modal-alias">Custom alias</Label>
              <Input
                id="modal-alias"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                placeholder="my-campaign"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="modal-expiration">Expiration</Label>
              <Select value={expiration} onValueChange={setExpiration}>
                <SelectTrigger id="modal-expiration" className="w-full">
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
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete link</DialogTitle>
            <DialogDescription>
              This will permanently delete {toDelete && formatShortUrl(toDelete.slug)}. Anyone visiting it will get a 404.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (toDelete) {
                  await deleteLink(toDelete.id);
                }
                setToDelete(null);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
