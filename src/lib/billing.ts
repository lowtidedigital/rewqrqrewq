// Billing API client - handles Stripe checkout, portal, and subscription status
import { config } from '@/config';
import { getAccessToken } from '@/lib/cognito';
import { PlanName } from '@/lib/plans';
import { toast } from 'sonner';

export interface SubscriptionStatus {
  plan: PlanName;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'none';
  stripeCustomerId?: string;
  subscriptionId?: string;
  currentPeriodEnd?: number; // Unix timestamp in seconds
  cancelAtPeriodEnd?: boolean;
  updatedAt?: string;
}

export interface CheckoutSessionResponse {
  url: string;
  sessionId?: string;
}

export interface PortalSessionResponse {
  url: string;
}

// Helper to check if user has pro-level access (Starter or Enterprise with active subscription)
export const hasProAccess = (status: SubscriptionStatus | null): boolean => {
  if (!status) return false;
  const isPaidPlan = status.plan === 'starter' || status.plan === 'enterprise';
  const isActive = status.status === 'active' || status.status === 'trialing';
  return isPaidPlan && isActive;
};

class BillingClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.apiUrl;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const token = await getAccessToken();
    if (!token) {
      // Redirect to login if not authenticated
      toast.error('Session expired – please sign in again');
      setTimeout(() => {
        window.location.href = '/auth?mode=login&redirect=' + encodeURIComponent(window.location.pathname);
      }, 1500);
      throw new Error('Not authenticated');
    }

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (networkError) {
      toast.error('Network error – please check your connection');
      throw new Error('Network error');
    }

    // Handle 401 - redirect to login
    if (response.status === 401) {
      toast.error('Session expired – please sign in again');
      setTimeout(() => {
        window.location.href = '/auth?mode=login&redirect=' + encodeURIComponent(window.location.pathname);
      }, 1500);
      throw new Error('Session expired');
    }

    if (!response.ok) {
      let errorMessage = 'Request failed';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  /**
   * Get current subscription status for the authenticated user
   */
  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    try {
      const response = await this.request<{
        plan?: string;
        status?: string;
        stripeCustomerId?: string;
        subscriptionId?: string;
        currentPeriodEnd?: number;
        cancelAtPeriodEnd?: boolean;
        updatedAt?: string;
      }>('GET', '/billing/status');

      return {
        plan: (response.plan as PlanName) || 'free',
        status: (response.status as SubscriptionStatus['status']) || 'none',
        stripeCustomerId: response.stripeCustomerId,
        subscriptionId: response.subscriptionId,
        currentPeriodEnd: response.currentPeriodEnd,
        cancelAtPeriodEnd: response.cancelAtPeriodEnd,
        updatedAt: response.updatedAt,
      };
    } catch (error) {
      // If billing status endpoint fails, assume free plan
      console.warn('Failed to fetch subscription status, defaulting to free:', error);
      return {
        plan: 'free',
        status: 'none',
      };
    }
  }

  /**
   * Create a Stripe checkout session for upgrading to a plan
   */
  async createCheckoutSession(planName: PlanName = 'starter'): Promise<CheckoutSessionResponse> {
    const response = await this.request<{
      url?: string;
      checkoutUrl?: string;
      sessionId?: string;
    }>('POST', '/billing/checkout', {
      plan: planName,
    });

    // Handle both possible response formats
    const url = response.url || response.checkoutUrl;
    if (!url) {
      throw new Error('No checkout URL returned');
    }

    return {
      url,
      sessionId: response.sessionId,
    };
  }

  /**
   * Create a Stripe customer portal session for managing subscription
   */
  async createPortalSession(): Promise<PortalSessionResponse> {
    const response = await this.request<{
      url?: string;
      portalUrl?: string;
    }>('POST', '/billing/portal');

    // Handle both possible response formats
    const url = response.url || response.portalUrl;
    if (!url) {
      throw new Error('No portal URL returned');
    }

    return { url };
  }
}

// Export singleton instance
export const billingApi = new BillingClient();

// Convenience functions
export const getSubscriptionStatus = () => billingApi.getSubscriptionStatus();
export const createCheckoutSession = (plan?: PlanName) => billingApi.createCheckoutSession(plan);
export const createPortalSession = () => billingApi.createPortalSession();
