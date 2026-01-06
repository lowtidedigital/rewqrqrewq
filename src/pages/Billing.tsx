import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  ExternalLink,
  Check,
  ArrowUpRight,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { PLANS, PlanName, formatPrice } from "@/lib/plans";
import { toast } from "sonner";

// TODO: Replace with real subscription data from API
const useSubscription = () => {
  // Mock data - replace with real API call
  return {
    plan: 'free' as PlanName,
    status: 'active',
    currentPeriodEnd: null,
    isLoading: false,
  };
};

const Billing = () => {
  const { plan: currentPlan, status, currentPeriodEnd, isLoading: subLoading } = useSubscription();
  const [isUpgrading, setIsUpgrading] = useState<PlanName | null>(null);

  const handleUpgrade = async (planName: PlanName) => {
    setIsUpgrading(planName);
    try {
      // TODO: Call POST /billing/checkout-session with plan
      // const response = await api.createCheckoutSession(planName);
      // window.location.href = response.checkoutUrl;
      toast.info("Stripe billing coming soon! Contact us for early access.", {
        action: {
          label: "Contact",
          onClick: () => window.open("mailto:support@linkharbour.io"),
        },
      });
    } catch (error) {
      toast.error("Failed to start upgrade process");
    } finally {
      setIsUpgrading(null);
    }
  };

  const handleManageBilling = async () => {
    try {
      // TODO: Call POST /billing/portal-session
      // const response = await api.createPortalSession();
      // window.location.href = response.portalUrl;
      toast.info("Billing portal coming soon!");
    } catch (error) {
      toast.error("Failed to open billing portal");
    }
  };

  const planOrder: PlanName[] = ['free', 'starter', 'pro', 'business'];
  const currentPlanIndex = planOrder.indexOf(currentPlan);

  if (subLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-8">
      {/* Header */}
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="font-display text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground">Manage your subscription and billing details.</p>
      </motion.div>

      {/* Current Plan */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-xl border border-border bg-card p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold">Current Plan</h2>
            <p className="text-sm text-muted-foreground">Your subscription details</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg bg-muted/30 border border-border/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl font-bold">{PLANS[currentPlan].displayName}</span>
              <Badge variant={status === 'active' ? 'default' : 'secondary'}>
                {status === 'active' ? 'Active' : status}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {formatPrice(PLANS[currentPlan])}{currentPlan !== 'free' && '/month'}
              {currentPeriodEnd && (
                <span className="ml-2">
                  · Renews {new Date(currentPeriodEnd).toLocaleDateString()}
                </span>
              )}
            </p>
          </div>
          
          {currentPlan !== 'free' && (
            <Button variant="outline" onClick={handleManageBilling}>
              <ExternalLink className="w-4 h-4" />
              Manage Billing
            </Button>
          )}
        </div>

        {/* Plan Limits */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 rounded-lg bg-muted/20">
            <p className="text-2xl font-bold">{PLANS[currentPlan].maxLinksTotal}</p>
            <p className="text-sm text-muted-foreground">Total links</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/20">
            <p className="text-2xl font-bold">{PLANS[currentPlan].trackedClicksMonthly.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Clicks/month</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/20">
            <p className="text-2xl font-bold">{PLANS[currentPlan].retentionDays}d</p>
            <p className="text-sm text-muted-foreground">Data retention</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/20">
            <p className="text-2xl font-bold">{PLANS[currentPlan].apiAccess ? '✓' : '—'}</p>
            <p className="text-sm text-muted-foreground">API access</p>
          </div>
        </div>
      </motion.div>

      {/* Upgrade Options */}
      {currentPlan !== 'business' && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold">Upgrade Your Plan</h2>
              <p className="text-sm text-muted-foreground">Unlock more features and higher limits</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {planOrder.slice(currentPlanIndex + 1).map((planName) => {
              const plan = PLANS[planName];
              const isPro = planName === 'pro';
              
              return (
                <div
                  key={planName}
                  className={`relative p-5 rounded-xl border ${
                    isPro ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  {isPro && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">Recommended</Badge>
                    </div>
                  )}
                  
                  <h3 className="font-semibold text-lg mb-1">{plan.displayName}</h3>
                  <p className="text-2xl font-bold mb-4">
                    {formatPrice(plan)}
                    <span className="text-sm font-normal text-muted-foreground">/mo</span>
                  </p>
                  
                  <ul className="space-y-2 mb-6">
                    {plan.features.slice(0, 4).map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    variant={isPro ? 'hero' : 'outline'}
                    className="w-full"
                    onClick={() => handleUpgrade(planName)}
                    disabled={isUpgrading === planName}
                  >
                    {isUpgrading === planName ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Upgrade
                        <ArrowUpRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>

          <p className="mt-4 text-sm text-muted-foreground text-center">
            Need more?{" "}
            <Link to="/pricing" className="text-primary hover:underline">
              View all plans
            </Link>{" "}
            or{" "}
            <a href="mailto:sales@linkharbour.io" className="text-primary hover:underline">
              contact sales
            </a>{" "}
            for Enterprise.
          </p>
        </motion.div>
      )}

      {/* API Access Notice */}
      {!PLANS[currentPlan].apiAccess && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6"
        >
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">API Access Requires Pro or Higher</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Programmatic API access is available on Pro ($25/mo) and Business ($75/mo) plans.
                Starter plan does not include API access.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUpgrade('pro')}
                disabled={isUpgrading === 'pro'}
              >
                {isUpgrading === 'pro' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Upgrade to Pro'
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Billing;
