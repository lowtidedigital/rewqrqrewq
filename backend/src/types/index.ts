// Shared types for ShortFuse backend

export interface Link {
  id: string;
  userId: string;
  slug: string;
  longUrl: string;
  title?: string;
  tags?: string[];
  notes?: string;
  enabled: boolean;
  privacyMode: boolean;
  redirectType: 301 | 302;
  expiresAt?: number; // Unix timestamp
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
  clickCount: number;
  // QR code metadata
  qrPngKey?: string;
  qrSvgKey?: string;
  qrUpdatedAt?: number;
}

export interface CreateLinkRequest {
  longUrl: string;
  customSlug?: string;
  title?: string;
  tags?: string[];
  notes?: string;
  enabled?: boolean;
  privacyMode?: boolean;
  redirectType?: 301 | 302;
  expiresAt?: string; // ISO date string
}

export interface UpdateLinkRequest {
  longUrl?: string;
  slug?: string;
  title?: string;
  tags?: string[];
  notes?: string;
  enabled?: boolean;
  privacyMode?: boolean;
  redirectType?: 301 | 302;
  expiresAt?: string | null;
}

export interface ClickEvent {
  eventId: string;
  linkId: string;
  slug: string;
  userId: string;
  timestamp: number;
  referrer?: string;
  userAgent?: string;
  country?: string;
  device?: string;
  ipHash?: string;
}

export interface AnalyticsSummary {
  totalClicks: number;
  clicksToday: number;
  clicksThisWeek: number;
  clicksThisMonth: number;
  topReferrers: { referrer: string; count: number }[];
  topCountries: { country: string; count: number }[];
  deviceBreakdown: { device: string; count: number }[];
  clicksOverTime: { date: string; count: number }[];
}

export interface PaginatedResponse<T> {
  items: T[];
  nextToken?: string;
  total?: number;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}
