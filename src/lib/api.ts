import { config } from '@/config';
import { getAccessToken } from '@/lib/cognito';

// Types matching backend
export interface Link {
  link_id: string;
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

export interface CreateLinkInput {
  long_url: string;
  custom_slug?: string;
  title?: string;
  tags?: string[];
  notes?: string;
  expires_at?: string;
  redirect_type?: 301 | 302;
  privacy_mode?: boolean;
}

export interface UpdateLinkInput {
  long_url?: string;
  slug?: string;
  title?: string;
  tags?: string[];
  notes?: string;
  enabled?: boolean;
  expires_at?: string | null;
  redirect_type?: 301 | 302;
  privacy_mode?: boolean;
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
    return this.request<Link>('POST', '/links', input);
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
    return this.request<PaginatedResponse<Link>>(
      'GET',
      `/links${query ? `?${query}` : ''}`
    );
  }

  async getLink(linkId: string): Promise<Link> {
    return this.request<Link>('GET', `/links/${linkId}`);
  }

  async updateLink(linkId: string, input: UpdateLinkInput): Promise<Link> {
    return this.request<Link>('PUT', `/links/${linkId}`, input);
  }

  async deleteLink(linkId: string): Promise<void> {
    return this.request<void>('DELETE', `/links/${linkId}`);
  }

  // Analytics
  async getLinkAnalytics(
    linkId: string,
    params?: { start_date?: string; end_date?: string }
  ): Promise<AnalyticsSummary> {
    const searchParams = new URLSearchParams();
    if (params?.start_date) searchParams.set('start_date', params.start_date);
    if (params?.end_date) searchParams.set('end_date', params.end_date);

    const query = searchParams.toString();
    return this.request<AnalyticsSummary>(
      'GET',
      `/links/${linkId}/analytics${query ? `?${query}` : ''}`
    );
  }

  async getDashboardStats(): Promise<{
    total_links: number;
    total_clicks: number;
    active_links: number;
    clicks_today: number;
    clicks_this_week: number;
    top_links: Link[];
  }> {
    return this.request('GET', '/analytics/dashboard');
  }

  // QR Code URLs (presigned)
  async getQrUrls(linkId: string): Promise<{ png_url: string; svg_url: string }> {
    return this.request('GET', `/links/${linkId}/qr`);
  }
}

// Export singleton instance
export const api = new ApiClient();
