import { API_BASE_URL } from "@/config/constants";

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
      return 1; // Backend accepts expirationInDays as Integer
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
