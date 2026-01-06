// Billing API client - handles Stripe checkout, portal, and subscription status
import { config } from '@/config';
import { getAccessToken } from '@/lib/cognito';
import { PlanName } from '@/lib/plans';

export interface SubscriptionStatus {
  plan: PlanName;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'none';
  stripeCustomerId?: string;
  subscriptionId?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

export interface CheckoutSessionResponse {
  checkoutUrl: string;
  sessionId: string;
}

export interface PortalSessionResponse {
  portalUrl: string;
}

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
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
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
        plan: string;
        status: string;
        stripeCustomerId?: string;
        subscriptionId?: string;
        currentPeriodEnd?: string;
        cancelAtPeriodEnd?: boolean;
      }>('GET', '/billing/status');

      return {
        plan: (response.plan as PlanName) || 'free',
        status: (response.status as SubscriptionStatus['status']) || 'none',
        stripeCustomerId: response.stripeCustomerId,
        subscriptionId: response.subscriptionId,
        currentPeriodEnd: response.currentPeriodEnd,
        cancelAtPeriodEnd: response.cancelAtPeriodEnd,
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
      checkoutUrl: string;
      sessionId: string;
    }>('POST', '/billing/checkout', {
      plan: planName,
    });

    return {
      checkoutUrl: response.checkoutUrl,
      sessionId: response.sessionId,
    };
  }

  /**
   * Create a Stripe customer portal session for managing subscription
   */
  async createPortalSession(): Promise<PortalSessionResponse> {
    const response = await this.request<{
      portalUrl: string;
    }>('POST', '/billing/portal');

    return {
      portalUrl: response.portalUrl,
    };
  }
}

// Export singleton instance
export const billingApi = new BillingClient();

// Convenience functions
export const getSubscriptionStatus = () => billingApi.getSubscriptionStatus();
export const createCheckoutSession = (plan?: PlanName) => billingApi.createCheckoutSession(plan);
export const createPortalSession = () => billingApi.createPortalSession();
