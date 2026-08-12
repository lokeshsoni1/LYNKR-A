import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { API_BASE_URL } from "@/config/constants";

export type User = { name: string; email: string };

export type LinkRecord = {
  id: string;
  slug: string;
  original: string;
  clicks: number;
  createdAt: string;
  expiresAt: string | null;
};

type Store = {
  user: User | null;
  setUser: (u: User | null) => void;
  logout: () => void;
  links: LinkRecord[];
  fetchMyLinks: () => Promise<void>;
  deleteLink: (id: string) => Promise<void>;
  addGuestLink: (link: LinkRecord) => void;
  addCreatedLink: (link: LinkRecord) => void;
};

const StoreContext = createContext<Store | null>(null);

const USER_KEY = "lynkr.user";
const USER_SESSION_KEY = "lynkr_user_session";
const TOKEN_KEY = "jwt_token";
const GUEST_LINKS_KEY = "lynkr_guest_links";
const USER_LINKS_KEY = "lynkr_user_links";

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [links, setLinks] = useState<LinkRecord[]>([]);

  const setUser = useCallback((u: User | null) => {
    setUserState(u);
    try {
      if (u) {
        localStorage.setItem(USER_KEY, JSON.stringify(u));
        localStorage.setItem(
          USER_SESSION_KEY,
          JSON.stringify({ name: u.name, email: u.email, loggedIn: true })
        );
      } else {
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(USER_SESSION_KEY);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(USER_SESSION_KEY);
    setUserState(null);
    try {
      const g = localStorage.getItem(GUEST_LINKS_KEY);
      if (g) setLinks(JSON.parse(g));
      else setLinks([]);
    } catch {
      setLinks([]);
    }
  }, []);

  const addGuestLink = useCallback((link: LinkRecord) => {
    setLinks((prev) => {
      const next = [link, ...prev.filter((l) => l.id !== link.id)];
      try {
        localStorage.setItem(GUEST_LINKS_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const addCreatedLink = useCallback((link: LinkRecord) => {
    setLinks((prev) => {
      const next = [link, ...prev.filter((l) => l.id !== link.id)];
      try {
        localStorage.setItem(USER_LINKS_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const fetchMyLinks = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      // Guest mode: load from localStorage
      try {
        const g = localStorage.getItem(GUEST_LINKS_KEY);
        if (g) setLinks(JSON.parse(g));
        else setLinks([]);
      } catch {
        setLinks([]);
      }
      return;
    }

    let localUserLinks: LinkRecord[] = [];
    try {
      const saved = localStorage.getItem(USER_LINKS_KEY);
      if (saved) localUserLinks = JSON.parse(saved);
    } catch {
      /* ignore */
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/urls/my-links`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const apiMapped: LinkRecord[] = json.data.map((item: any) => ({
            id: String(item.id),
            slug: item.customAlias || item.shortCode,
            original: item.originalUrl,
            clicks: item.clickCount || 0,
            createdAt: item.createdAt,
            expiresAt: item.expiresAt,
          }));

          // Merge backend API links with local user links so user NEVER loses created URLs
          const mergedMap = new Map<string, LinkRecord>();
          [...apiMapped, ...localUserLinks].forEach((link) => {
            if (link && link.id) {
              mergedMap.set(link.id, link);
            }
          });

          const mergedList = Array.from(mergedMap.values());
          setLinks(mergedList);
          try {
            localStorage.setItem(USER_LINKS_KEY, JSON.stringify(mergedList));
          } catch {
            /* ignore */
          }
          return;
        }
      }
    } catch (e) {
      console.error("Failed to fetch user links from backend:", e);
    }

    // Fallback to local user links if backend request fails/times out
    if (localUserLinks.length > 0) {
      setLinks(localUserLinks);
    }
  }, []);

  const deleteLink = useCallback(
    async (id: string) => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        // Guest mode deletion
        setLinks((prev) => {
          const next = prev.filter((l) => l.id !== id);
          try {
            localStorage.setItem(GUEST_LINKS_KEY, JSON.stringify(next));
          } catch {
            /* ignore */
          }
          return next;
        });
        return;
      }
      setLinks((prev) => {
        const next = prev.filter((l) => l.id !== id);
        try {
          localStorage.setItem(USER_LINKS_KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
      try {
        await fetch(`${API_BASE_URL}/api/v1/urls/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (e) {
        console.error("Failed to delete link on server:", e);
      }
    },
    [],
  );

  useEffect(() => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const sessionStr = localStorage.getItem(USER_SESSION_KEY);
      const uStr = localStorage.getItem(USER_KEY);
      
      if (sessionStr) {
        const parsed = JSON.parse(sessionStr);
        setUserState({ name: parsed.name || "User", email: parsed.email || "user@lynkr.com" });
      } else if (uStr) {
        setUserState(JSON.parse(uStr));
      } else if (token) {
        const fallbackUser = { name: "User", email: "user@lynkr.com" };
        setUserState(fallbackUser);
        localStorage.setItem(
          USER_SESSION_KEY,
          JSON.stringify({ name: fallbackUser.name, email: fallbackUser.email, loggedIn: true })
        );
      }
    } catch {
      /* ignore */
    }
    fetchMyLinks();
  }, [fetchMyLinks]);

  const value = useMemo<Store>(
    () => ({
      user,
      setUser,
      logout,
      links,
      fetchMyLinks,
      deleteLink,
      addGuestLink,
      addCreatedLink,
    }),
    [user, setUser, logout, links, fetchMyLinks, deleteLink, addGuestLink, addCreatedLink],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within AppStoreProvider");
  return ctx;
}
