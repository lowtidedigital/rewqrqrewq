// Plan configuration - Single source of truth for all plan limits and features
// These MUST match the backend enforcement in Lambda handlers
// 3-tier model: Free, Pro ($12/mo), Enterprise

export type PlanName = 'free' | 'pro' | 'enterprise';

export interface PlanConfig {
  name: PlanName;
  displayName: string;
  price: number; // Monthly price in USD (0 for free, -1 for custom)
  stripePriceId?: string; // Stripe price ID for checkout
  maxLinksTotal: number;
  trackedClicksMonthly: number;
  retentionDays: number;
  apiAccess: boolean;
  bulkCreate: boolean; // Can create links in bulk
  customDomains: number;
  features: string[];
}

export const PLANS: Record<PlanName, PlanConfig> = {
  free: {
    name: 'free',
    displayName: 'Free',
    price: 0,
    maxLinksTotal: 50,
    trackedClicksMonthly: 1_000,
    retentionDays: 7,
    apiAccess: false,
    bulkCreate: false,
    customDomains: 0,
    features: [
      '50 short links',
      '1,000 tracked clicks/month',
      '7-day analytics retention',
      'QR codes (PNG)',
      'Basic analytics',
    ],
  },
  pro: {
    name: 'pro',
    displayName: 'Pro',
    price: 12,
    stripePriceId: 'price_1SmQWQRd9hGS6kHhuXA5XkpL',
    maxLinksTotal: 500,
    trackedClicksMonthly: 25_000,
    retentionDays: 90,
    apiAccess: true,
    bulkCreate: true,
    customDomains: 3,
    features: [
      '500 short links',
      '25,000 tracked clicks/month',
      '90-day analytics retention',
      'QR codes (PNG + SVG)',
      'Custom slugs',
      '3 custom domains',
      'Bulk link creation',
      'API access',
      'Priority email support',
    ],
  },
  enterprise: {
    name: 'enterprise',
    displayName: 'Enterprise',
    price: -1, // Custom pricing
    maxLinksTotal: Infinity,
    trackedClicksMonthly: Infinity,
    retentionDays: Infinity,
    apiAccess: true,
    bulkCreate: true,
    customDomains: Infinity,
    features: [
      'Unlimited links',
      'Unlimited tracked clicks',
      'Unlimited retention',
      'All Pro features',
      'Unlimited custom domains',
      'Bulk link creation',
      'Custom integrations',
      'SLA guarantee',
      'Dedicated infrastructure',
      'SSO/SAML',
      'Dedicated account manager',
    ],
  },
};

// Helper to get plan by name
export const getPlan = (planName: PlanName): PlanConfig => {
  return PLANS[planName] || PLANS.free;
};

// Check if a plan has API access
export const hasApiAccess = (planName: PlanName): boolean => {
  return PLANS[planName]?.apiAccess ?? false;
};

// Check if user is on a paid plan
export const isPaidPlan = (planName: PlanName): boolean => {
  return planName === 'pro' || planName === 'enterprise';
};

// Check if user can bulk create links
export const canBulkCreate = (planName: PlanName): boolean => {
  return PLANS[planName]?.bulkCreate ?? false;
};

// Check if user can create more links
export const canCreateLink = (planName: PlanName, currentLinkCount: number): boolean => {
  const plan = getPlan(planName);
  return currentLinkCount < plan.maxLinksTotal;
};

// Get remaining links
export const getRemainingLinks = (planName: PlanName, currentLinkCount: number): number => {
  const plan = getPlan(planName);
  return Math.max(0, plan.maxLinksTotal - currentLinkCount);
};

// Format price for display
export const formatPrice = (plan: PlanConfig): string => {
  if (plan.price === 0) return 'Free';
  if (plan.price === -1) return 'Custom';
  return `$${plan.price}`;
};
