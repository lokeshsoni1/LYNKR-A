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
};

const StoreContext = createContext<Store | null>(null);

const USER_KEY = "lynkr.user";
const TOKEN_KEY = "jwt_token";
const GUEST_LINKS_KEY = "lynkr_guest_links";

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [links, setLinks] = useState<LinkRecord[]>([]);

  const setUser = useCallback((u: User | null) => {
    setUserState(u);
    try {
      if (u) {
        localStorage.setItem(USER_KEY, JSON.stringify(u));
      } else {
        localStorage.removeItem(USER_KEY);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
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
      const next = [link, ...prev];
      try {
        localStorage.setItem(GUEST_LINKS_KEY, JSON.stringify(next));
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
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/urls/my-links`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const mapped: LinkRecord[] = json.data.map((item: any) => ({
            id: String(item.id),
            slug: item.customAlias || item.shortCode,
            original: item.originalUrl,
            clicks: item.clickCount || 0,
            createdAt: item.createdAt,
            expiresAt: item.expiresAt,
          }));
          setLinks(mapped);
        }
      }
    } catch (e) {
      console.error("Failed to fetch user links:", e);
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
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/urls/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          setLinks((prev) => prev.filter((l) => l.id !== id));
        }
      } catch (e) {
        console.error("Failed to delete link:", e);
      }
    },
    [],
  );

  useEffect(() => {
    try {
      const u = localStorage.getItem(USER_KEY);
      if (u) setUserState(JSON.parse(u));
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
    }),
    [user, setUser, logout, links, fetchMyLinks, deleteLink, addGuestLink],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within AppStoreProvider");
  return ctx;
}
