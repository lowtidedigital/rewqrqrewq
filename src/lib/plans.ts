// Plan configuration - Single source of truth for all plan limits and features
// These MUST match the backend enforcement in Lambda handlers

export type PlanName = 'free' | 'starter' | 'pro' | 'business' | 'enterprise';

export interface PlanConfig {
  name: PlanName;
  displayName: string;
  price: number; // Monthly price in USD (0 for free, -1 for custom)
  maxLinksTotal: number;
  trackedClicksMonthly: number;
  retentionDays: number;
  apiAccess: boolean;
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
    customDomains: 0,
    features: [
      '50 short links',
      '1,000 tracked clicks/month',
      '7-day analytics retention',
      'QR codes (PNG)',
      'Basic analytics',
    ],
  },
  starter: {
    name: 'starter',
    displayName: 'Starter',
    price: 9,
    maxLinksTotal: 250,
    trackedClicksMonthly: 10_000,
    retentionDays: 30,
    apiAccess: false, // IMPORTANT: Starter does NOT get API access
    customDomains: 1,
    features: [
      '250 short links',
      '10,000 tracked clicks/month',
      '30-day analytics retention',
      'QR codes (PNG + SVG)',
      'Custom slugs',
      '1 custom domain',
      'Priority email support',
    ],
  },
  pro: {
    name: 'pro',
    displayName: 'Pro',
    price: 25,
    maxLinksTotal: 2_000,
    trackedClicksMonthly: 100_000,
    retentionDays: 365,
    apiAccess: true, // Pro unlocks API access
    customDomains: 5,
    features: [
      '2,000 short links',
      '100,000 tracked clicks/month',
      '1-year analytics retention',
      'QR codes (PNG + SVG)',
      'Custom slugs & link expiration',
      '5 custom domains',
      'API access',
      'Priority support',
    ],
  },
  business: {
    name: 'business',
    displayName: 'Business',
    price: 75,
    maxLinksTotal: 10_000,
    trackedClicksMonthly: 500_000,
    retentionDays: 730, // 2 years
    apiAccess: true,
    customDomains: 20,
    features: [
      '10,000 short links',
      '500,000 tracked clicks/month',
      '2-year analytics retention',
      'All Pro features',
      '20 custom domains',
      'Team management',
      'Dedicated account manager',
      'SSO/SAML (coming soon)',
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
    customDomains: Infinity,
    features: [
      'Unlimited links',
      'Unlimited tracked clicks',
      'Unlimited retention',
      'All Business features',
      'Unlimited custom domains',
      'Custom integrations',
      'SLA guarantee',
      'Dedicated infrastructure',
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
