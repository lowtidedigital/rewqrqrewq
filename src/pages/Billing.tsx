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
  Calendar,
} from "lucide-react";
import { PLANS, PlanName, formatPrice } from "@/lib/plans";
import { createCheckoutSession, createPortalSession } from "@/lib/billing";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { toast } from "sonner";

const Billing = () => {
  const { 
    subscription, 
    currentPlan, 
    isLoading: subLoading, 
    isActive,
    canAccessApi,
    refresh 
  } = useSubscription();
  
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isManaging, setIsManaging] = useState(false);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      const { checkoutUrl } = await createCheckoutSession('starter');
      window.location.href = checkoutUrl;
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || "Failed to start upgrade process");
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleManageBilling = async () => {
    setIsManaging(true);
    try {
      const { portalUrl } = await createPortalSession();
      window.location.href = portalUrl;
    } catch (error: any) {
      console.error('Portal error:', error);
      toast.error(error.message || "Failed to open billing portal");
    } finally {
      setIsManaging(false);
    }
  };

  if (subLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const plan = PLANS[currentPlan];
  const isCanceling = subscription?.cancelAtPeriodEnd;

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
              <span className="text-2xl font-bold">{plan.displayName}</span>
              <Badge variant={isActive ? 'default' : currentPlan === 'free' ? 'secondary' : 'destructive'}>
                {isCanceling ? 'Canceling' : isActive ? 'Active' : currentPlan === 'free' ? 'Free' : subscription?.status || 'Inactive'}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {formatPrice(plan)}{currentPlan !== 'free' && currentPlan !== 'enterprise' && '/month'}
              {subscription?.currentPeriodEnd && (
                <span className="ml-2 inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {isCanceling ? 'Ends' : 'Renews'} {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </span>
              )}
            </p>
          </div>
          
          {currentPlan !== 'free' && (
            <Button 
              variant="outline" 
              onClick={handleManageBilling}
              disabled={isManaging}
            >
              {isManaging ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ExternalLink className="w-4 h-4" />
              )}
              Manage Billing
            </Button>
          )}
        </div>

        {/* Plan Limits */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 rounded-lg bg-muted/20">
            <p className="text-2xl font-bold">
              {plan.maxLinksTotal === Infinity ? '∞' : plan.maxLinksTotal}
            </p>
            <p className="text-sm text-muted-foreground">Total links</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/20">
            <p className="text-2xl font-bold">
              {plan.trackedClicksMonthly === Infinity ? '∞' : plan.trackedClicksMonthly.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Clicks/month</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/20">
            <p className="text-2xl font-bold">
              {plan.retentionDays === Infinity ? '∞' : `${plan.retentionDays}d`}
            </p>
            <p className="text-sm text-muted-foreground">Data retention</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/20">
            <p className="text-2xl font-bold">{plan.apiAccess ? '✓' : '—'}</p>
            <p className="text-sm text-muted-foreground">API access</p>
          </div>
        </div>
      </motion.div>

      {/* Upgrade Options - Only show for free users */}
      {currentPlan === 'free' && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-xl border border-primary/30 bg-primary/5 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold">Upgrade to Starter</h2>
              <p className="text-sm text-muted-foreground">Unlock API access and more features</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Starter Plan Card */}
            <div className="p-5 rounded-xl border border-primary bg-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Starter</h3>
                <Badge className="bg-primary text-primary-foreground">Recommended</Badge>
              </div>
              
              <p className="text-3xl font-bold mb-4">
                $12
                <span className="text-sm font-normal text-muted-foreground">/month</span>
              </p>
              
              <ul className="space-y-2 mb-6">
                {PLANS.starter.features.slice(0, 5).map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button
                variant="hero"
                className="w-full"
                onClick={handleUpgrade}
                disabled={isUpgrading}
              >
                {isUpgrading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Upgrade Now
                    <ArrowUpRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>

            {/* Enterprise Card */}
            <div className="p-5 rounded-xl border border-border bg-card/50">
              <h3 className="font-semibold text-lg mb-2">Enterprise</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Need unlimited links, custom integrations, SLA guarantees, or dedicated infrastructure?
              </p>
              
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Unlimited everything</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">SSO/SAML</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Dedicated support</span>
                </li>
              </ul>
              
              <Button variant="outline" className="w-full" asChild>
                <a href="mailto:sales@linkharbour.io">
                  Contact Sales
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </div>

          <p className="mt-4 text-sm text-muted-foreground text-center">
            <Link to="/pricing" className="text-primary hover:underline">
              Compare all features →
            </Link>
          </p>
        </motion.div>
      )}

      {/* API Access Notice - for free users */}
      {!canAccessApi && currentPlan === 'free' && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6"
        >
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">API Access Requires Starter or Enterprise</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Programmatic API access is available on Starter ($12/mo) and Enterprise plans.
                Upgrade to unlock the full Link Harbour API.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleUpgrade}
                disabled={isUpgrading}
              >
                {isUpgrading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Upgrade to Starter'
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Starter users - show portal access */}
      {currentPlan === 'starter' && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <div className="flex items-start gap-4">
            <Check className="w-6 h-6 text-primary flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">You're on the Starter plan!</h3>
              <p className="text-sm text-muted-foreground mb-3">
                You have full API access and all Starter features. Need more? Contact us for Enterprise pricing.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManageBilling}
                  disabled={isManaging}
                >
                  {isManaging ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4" />
                      Manage Subscription
                    </>
                  )}
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <a href="mailto:sales@linkharbour.io">
                    Contact for Enterprise
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Billing;
