// Subscription context - provides plan status across the app
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSubscriptionStatus, SubscriptionStatus, hasProAccess } from '@/lib/billing';
import { PlanName, hasApiAccess, isPaidPlan } from '@/lib/plans';
import { useAuth } from '@/contexts/AuthContext';

interface SubscriptionContextType {
  subscription: SubscriptionStatus | null;
  isLoading: boolean;
  error: string | null;
  currentPlan: PlanName;
  canAccessApi: boolean;
  isPaid: boolean;
  isActive: boolean;
  hasProPlanAccess: boolean; // New: true only if starter/enterprise AND active
  refresh: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    if (!isAuthenticated) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const status = await getSubscriptionStatus();
      setSubscription(status);
    } catch (err: any) {
      console.error('Failed to fetch subscription:', err);
      setError(err.message || 'Failed to load subscription');
      // Default to free plan on error
      setSubscription({
        plan: 'free',
        status: 'none',
      });
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch subscription when auth state changes
  useEffect(() => {
    if (!authLoading) {
      fetchSubscription();
    }
  }, [authLoading, isAuthenticated, fetchSubscription]);

  const currentPlan: PlanName = subscription?.plan || 'free';
  const canAccessApi = hasApiAccess(currentPlan);
  const isPaid = isPaidPlan(currentPlan);
  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing';
  const hasProPlanAccess = hasProAccess(subscription);

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        isLoading: isLoading || authLoading,
        error,
        currentPlan,
        canAccessApi,
        isPaid,
        isActive,
        hasProPlanAccess,
        refresh: fetchSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
