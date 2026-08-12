import { API_BASE_URL, formatShortUrl } from "@/config/constants";

export type User = {
  id?: number;
  name?: string;
  email: string;
};

export type UrlResponseDto = {
  id: number;
  originalUrl: string;
  shortCode: string;
  customAlias: string | null;
  shortUrl: string;
  createdAt: string;
  expiresAt: string | null;
  clickCount: number;
  expired: boolean;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type LinkRecord = {
  id: string;
  slug: string;
  original: string;
  clicks: number;
  createdAt: string;
  expiresAt: string | null;
};

export const EXPIRATION_OPTIONS = [
  { value: "never", label: "Never" },
  { value: "1h", label: "1 Hour" },
  { value: "24h", label: "24 Hours" },
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
] as const;

export function isExpired(link: LinkRecord) {
  return !!link.expiresAt && new Date(link.expiresAt).getTime() < Date.now();
}

export function formatDate(iso: string | null) {
  if (!iso) return "Never";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Convert expiration UI value to days for API (null if never)
export function getExpirationInDays(value: string): number | null {
  switch (value) {
    case "1h":
      return 1;
    case "24h":
      return 1;
    case "7d":
      return 7;
    case "30d":
      return 30;
    default:
      return null;
  }
}

export const CLICKS_7D = [
  { label: "Mon", clicks: 0 },
  { label: "Tue", clicks: 0 },
  { label: "Wed", clicks: 0 },
  { label: "Thu", clicks: 0 },
  { label: "Fri", clicks: 0 },
  { label: "Sat", clicks: 0 },
  { label: "Sun", clicks: 0 },
];

export const CLICKS_30D = Array.from({ length: 30 }, (_, i) => ({
  label: `${i + 1}`,
  clicks: 0,
}));

export const DEVICES = [
  { label: "Mobile", value: 0 },
  { label: "Desktop", value: 0 },
  { label: "Tablet", value: 0 },
];

export const BROWSERS = [
  { label: "Chrome", value: 0 },
  { label: "Safari", value: 0 },
  { label: "Firefox", value: 0 },
  { label: "Edge", value: 0 },
];

export const REFERRERS = [
  { label: "Direct", value: 0 },
  { label: "Twitter / X", value: 0 },
  { label: "LinkedIn", value: 0 },
  { label: "Newsletter", value: 0 },
];

export const RECENT_ACTIVITY: { slug: string; device: string; source: string; time: string }[] = [];
