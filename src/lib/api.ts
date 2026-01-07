import { config } from '@/config';
import { getAccessToken } from '@/lib/cognito';

// Types matching backend (uses camelCase)
export interface Link {
  link_id: string;         // Frontend uses snake_case for response mapping
  owner_user_id: string;
  slug: string;
  long_url: string;
  title?: string;
  tags?: string[];
  notes?: string;
  enabled: boolean;
  expires_at?: string;
  redirect_type: 301 | 302;
  privacy_mode: boolean;
  qr_png_key?: string;
  qr_svg_key?: string;
  qr_png_url?: string;
  qr_svg_url?: string;
  qr_updated_at?: string;
  created_at: string;
  updated_at: string;
  click_count?: number;
}

// Backend expects camelCase for requests
export interface CreateLinkInput {
  longUrl: string;        // camelCase - matches backend CreateLinkRequest
  customSlug?: string;
  title?: string;
  tags?: string[];
  notes?: string;
  expiresAt?: string;     // ISO date string
  redirectType?: 301 | 302;
  privacyMode?: boolean;
  enabled?: boolean;
}

export interface UpdateLinkInput {
  longUrl?: string;
  slug?: string;
  title?: string;
  tags?: string[];
  notes?: string;
  enabled?: boolean;
  expiresAt?: string | null;
  redirectType?: 301 | 302;
  privacyMode?: boolean;
}

export interface AnalyticsSummary {
  total_clicks: number;
  clicks_today: number;
  clicks_this_week: number;
  clicks_this_month: number;
  top_referrers: { referrer: string; count: number }[];
  top_countries: { country: string; count: number }[];
  device_breakdown: { device: string; count: number }[];
  clicks_over_time: { date: string; count: number }[];
  recent_clicks: ClickEvent[];
}

export interface ClickEvent {
  event_id: string;
  timestamp: string;
  referrer?: string;
  country?: string;
  device?: string;
  browser?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  next_cursor?: string;
  total_count?: number;
}

export interface ApiError {
  message: string;
  code?: string;
  status: number;
}

// Helper to convert backend response (camelCase) to frontend format (snake_case)
// Backend returns camelCase, but we store snake_case for consistency in frontend
function transformLinkResponse(backendLink: any): Link {
  return {
    link_id: backendLink.id || backendLink.link_id,
    owner_user_id: backendLink.userId || backendLink.owner_user_id,
    slug: backendLink.slug,
    long_url: backendLink.longUrl || backendLink.long_url,
    title: backendLink.title,
    tags: backendLink.tags,
    notes: backendLink.notes,
    enabled: backendLink.enabled,
    expires_at: backendLink.expiresAt || backendLink.expires_at,
    redirect_type: backendLink.redirectType || backendLink.redirect_type,
    privacy_mode: backendLink.privacyMode ?? backendLink.privacy_mode ?? false,
    qr_png_key: backendLink.qrPngKey || backendLink.qr_png_key,
    qr_svg_key: backendLink.qrSvgKey || backendLink.qr_svg_key,
    qr_png_url: backendLink.qrPngUrl || backendLink.qr_png_url,
    qr_svg_url: backendLink.qrSvgUrl || backendLink.qr_svg_url,
    qr_updated_at: backendLink.qrUpdatedAt || backendLink.qr_updated_at,
    created_at: backendLink.createdAt ? new Date(backendLink.createdAt).toISOString() : backendLink.created_at,
    updated_at: backendLink.updatedAt ? new Date(backendLink.updatedAt).toISOString() : backendLink.updated_at,
    click_count: backendLink.clickCount ?? backendLink.click_count ?? 0,
  };
}

// API client with automatic token attachment
class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.apiUrl;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    requiresAuth = true
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (requiresAuth) {
      const token = await getAccessToken();
      if (!token) {
        throw { message: 'Not authenticated', status: 401 } as ApiError;
      }
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      let errorMessage = 'Request failed';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        errorMessage = response.statusText;
      }
      throw {
        message: errorMessage,
        status: response.status,
      } as ApiError;
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  // Links CRUD
  async createLink(input: CreateLinkInput): Promise<Link> {
    // Send camelCase to backend, transform response to snake_case
    const response = await this.request<any>('POST', '/links', input);
    return transformLinkResponse(response);
  }

  async getLinks(params?: {
    cursor?: string;
    limit?: number;
    search?: string;
    tag?: string;
  }): Promise<PaginatedResponse<Link>> {
    const searchParams = new URLSearchParams();
    if (params?.cursor) searchParams.set('cursor', params.cursor);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.tag) searchParams.set('tag', params.tag);

    const query = searchParams.toString();
    const response = await this.request<any>(
      'GET',
      `/links${query ? `?${query}` : ''}`
    );
    
    return {
      items: (response.items || []).map(transformLinkResponse),
      next_cursor: response.nextToken,
      total_count: response.total,
    };
  }

  async getLink(linkId: string): Promise<Link> {
    const response = await this.request<any>('GET', `/links/${linkId}`);
    return transformLinkResponse(response);
  }

  async updateLink(linkId: string, input: UpdateLinkInput): Promise<Link> {
    const response = await this.request<any>('PUT', `/links/${linkId}`, input);
    return transformLinkResponse(response);
  }

  async deleteLink(linkId: string): Promise<void> {
    return this.request<void>('DELETE', `/links/${linkId}`);
  }

  // Analytics
  async getLinkAnalytics(
    linkId: string,
    params?: { start_date?: string; end_date?: string; days?: number }
  ): Promise<AnalyticsSummary> {
    const searchParams = new URLSearchParams();
    if (params?.start_date) searchParams.set('start_date', params.start_date);
    if (params?.end_date) searchParams.set('end_date', params.end_date);
    if (params?.days) searchParams.set('days', params.days.toString());

    const query = searchParams.toString();
    const response = await this.request<any>(
      'GET',
      `/links/${linkId}/analytics${query ? `?${query}` : ''}`
    );

    // Dev logging for debugging
    if (import.meta.env.DEV) {
      console.debug('[api.getLinkAnalytics] Raw response:', response);
    }

    // Normalize totalClicks with safe fallbacks
    const summaryTotalClicks = response.summary?.totalClicks ?? 0;
    const responseTotalClicks = response.totalClicks ?? 0;
    const clicksToday = response.summary?.clicksToday ?? 0;
    const clicksThisWeek = response.summary?.clicksThisWeek ?? 0;
    const clicksThisMonth = response.summary?.clicksThisMonth ?? 0;
    
    // Use the best available total with fallback chain
    const totalClicksUI = responseTotalClicks > 0 
      ? responseTotalClicks 
      : summaryTotalClicks > 0 
        ? summaryTotalClicks 
        : Math.max(clicksToday, clicksThisWeek, clicksThisMonth, 0);

    // Get clicks over time with fallback to last7Days
    const rawClicksOverTime = response.summary?.clicksOverTime || response.clicks_over_time || [];
    const last7Days = response.last7Days || [];
    const clicksOverTime = rawClicksOverTime.length > 0 ? rawClicksOverTime : last7Days;

    return {
      total_clicks: totalClicksUI,
      clicks_today: clicksToday,
      clicks_this_week: clicksThisWeek,
      clicks_this_month: clicksThisMonth,
      top_referrers: (response.referrers || response.summary?.topReferrers || response.top_referrers || []),
      top_countries: (response.countries || response.summary?.topCountries || response.top_countries || []),
      device_breakdown: (response.devices || response.summary?.deviceBreakdown || response.device_breakdown || []),
      clicks_over_time: clicksOverTime.map((d: any) => ({ date: d.date, count: d.clicks ?? d.count ?? 0 })),
      recent_clicks: (response.recentEvents || response.recent_clicks || [])
        .map((e: any) => ({
          event_id: e.eventId || e.event_id || '',
          timestamp: e.timestamp,
          referrer: e.referrer,
          country: e.country,
          device: e.device,
        })),
    };
  }

  async getDashboardStats(): Promise<{
    total_links: number;
    total_clicks: number;
    active_links: number;
    clicks_today: number;
    clicks_this_week: number;
    top_links: { link_id: string; slug: string; title?: string; clicks: number }[];
  }> {
    const response = await this.request<any>('GET', '/analytics/dashboard');
    
    // Dev logging for debugging
    if (import.meta.env.DEV) {
      console.debug('[api.getDashboardStats] Raw response:', response);
    }

    // Normalize totals with fallback chain
    const totalClicks = response.totalClicks ?? response.total_clicks ?? 0;
    const clicksToday = response.clicksToday ?? response.clicks_today ?? 0;
    const clicksThisWeek = response.clicksThisWeek ?? response.clicks_this_week ?? 0;
    
    // Ensure totalClicks is not 0 when we have recent clicks
    const totalClicksUI = totalClicks > 0 ? totalClicks : Math.max(clicksToday, clicksThisWeek, 0);

    // Transform top links with proper click counts
    const topLinks = (response.topLinks || response.top_links || []).map((l: any) => ({
      link_id: l.id || l.link_id,
      slug: l.slug,
      title: l.title,
      clicks: l.clicks ?? l.clickCount ?? l.click_count ?? 0,
    }));

    return {
      total_links: response.totalLinks ?? response.total_links ?? 0,
      total_clicks: totalClicksUI,
      active_links: response.activeLinks ?? response.active_links ?? 0,
      clicks_today: clicksToday,
      clicks_this_week: clicksThisWeek,
      top_links: topLinks,
    };
  }

  // QR Code URLs (presigned)
  async getQrUrls(linkId: string): Promise<{ png_url: string; svg_url: string }> {
    const response = await this.request<any>('GET', `/links/${linkId}/qr`);
    return {
      png_url: response.pngUrl || response.png_url,
      svg_url: response.svgUrl || response.svg_url,
    };
  }
}

// Export singleton instance
export const api = new ApiClient();
