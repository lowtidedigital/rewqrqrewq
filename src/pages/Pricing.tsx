import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import BrandLogo from "@/components/BrandLogo";
import { Check, Star, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLANS, formatPrice } from "@/lib/plans";
import { createCheckoutSession } from "@/lib/billing";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { toast } from "sonner";

// Feature comparison for the table (3-tier)
const featureComparison = [
  { feature: "Short links", free: "50", starter: "500", enterprise: "Unlimited" },
  { feature: "Tracked clicks/month", free: "1,000", starter: "25,000", enterprise: "Unlimited" },
  { feature: "Analytics retention", free: "7 days", starter: "90 days", enterprise: "Unlimited" },
  { feature: "QR codes", free: "PNG", starter: "PNG + SVG", enterprise: "PNG + SVG" },
  { feature: "Custom slugs", free: false, starter: true, enterprise: true },
  { feature: "Link expiration", free: false, starter: true, enterprise: true },
  { feature: "Custom domains", free: "—", starter: "3", enterprise: "Unlimited" },
  { feature: "API access", free: false, starter: true, enterprise: true },
  { feature: "Priority support", free: false, starter: true, enterprise: true },
  { feature: "SSO/SAML", free: false, starter: false, enterprise: true },
  { feature: "Dedicated account manager", free: false, starter: false, enterprise: true },
  { feature: "SLA guarantee", free: false, starter: false, enterprise: true },
];

const Pricing = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { currentPlan, isActive } = useSubscription();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/auth?mode=signup');
    }
  };

  const handleUpgrade = async () => {
    if (!isAuthenticated) {
      navigate('/auth?mode=signup');
      return;
    }

    // Already on starter or enterprise
    if ((currentPlan === 'starter' || currentPlan === 'enterprise') && isActive) {
      navigate('/dashboard/billing');
      return;
    }

    setIsUpgrading(true);
    try {
      const { url } = await createCheckoutSession('starter');
      window.location.href = url;
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || "Failed to start upgrade process");
    } finally {
      setIsUpgrading(false);
    }
  };

  const getStarterButtonText = () => {
    if (!isAuthenticated) return 'Start with Starter';
    if ((currentPlan === 'starter' || currentPlan === 'enterprise') && isActive) return 'Manage Plan';
    return 'Upgrade to Starter';
  };

  const plans = [
    {
      ...PLANS.free,
      cta: isAuthenticated ? "Current Plan" : "Get Started",
      popular: false,
      onClick: handleGetStarted,
      isCurrentPlan: isAuthenticated && currentPlan === 'free',
    },
    {
      ...PLANS.starter,
      cta: getStarterButtonText(),
      popular: true,
      onClick: handleUpgrade,
      isCurrentPlan: isAuthenticated && currentPlan === 'starter' && isActive,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-24 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-4">
              Simple, Transparent{" "}
              <span className="gradient-text">Pricing</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start free, upgrade when you need more. API access included in Starter.
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={cn(
                  "relative rounded-2xl border bg-card p-8 flex flex-col",
                  plan.popular
                    ? "border-primary shadow-xl shadow-primary/10 md:scale-105"
                    : "border-border"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-1 px-3 py-1 rounded-full gradient-primary text-primary-foreground text-sm font-medium">
                      <Star className="w-3 h-3" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="font-display text-2xl font-bold mb-2">{plan.displayName}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-5xl font-bold">{formatPrice(plan)}</span>
                    {plan.price > 0 && (
                      <span className="text-muted-foreground text-lg">/month</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.popular ? "hero" : "outline"}
                  size="lg"
                  className="w-full"
                  onClick={plan.onClick}
                  disabled={plan.isCurrentPlan || (plan.popular && isUpgrading)}
                >
                  {plan.popular && isUpgrading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : plan.isCurrentPlan ? (
                    <>
                      <Check className="w-4 h-4" />
                      Current Plan
                    </>
                  ) : (
                    plan.cta
                  )}
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Enterprise CTA */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="max-w-3xl mx-auto mb-20"
          >
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <h3 className="font-display text-2xl font-bold mb-2">Enterprise</h3>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                Need unlimited links, custom integrations, SLA guarantees, SSO, or dedicated infrastructure? 
                Let's build a plan that fits your organization.
              </p>
              <Button variant="hero" size="lg" asChild>
                <a href="mailto:sales@linkharbour.io?subject=Link%20Harbour%20Enterprise%20Inquiry">Contact Sales</a>
              </Button>
            </div>
          </motion.div>

          {/* Feature Comparison Table */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="font-display text-2xl font-bold text-center mb-8">Compare Plans</h2>
            
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left py-4 px-4 font-medium">Feature</th>
                      <th className="text-center py-4 px-4 font-medium">Free</th>
                      <th className="text-center py-4 px-4 font-medium bg-primary/5">Starter</th>
                      <th className="text-center py-4 px-4 font-medium">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody>
                    {featureComparison.map((row, i) => (
                      <tr key={row.feature} className={i % 2 === 0 ? "" : "bg-muted/20"}>
                        <td className="py-3 px-4 text-muted-foreground">{row.feature}</td>
                        <td className="py-3 px-4 text-center">
                          {typeof row.free === "boolean" ? (
                            row.free ? (
                              <Check className="w-4 h-4 text-primary mx-auto" />
                            ) : (
                              <X className="w-4 h-4 text-muted-foreground/50 mx-auto" />
                            )
                          ) : (
                            <span className="text-sm">{row.free}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center bg-primary/5">
                          {typeof row.starter === "boolean" ? (
                            row.starter ? (
                              <Check className="w-4 h-4 text-primary mx-auto" />
                            ) : (
                              <X className="w-4 h-4 text-muted-foreground/50 mx-auto" />
                            )
                          ) : (
                            <span className="text-sm font-medium">{row.starter}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {typeof row.enterprise === "boolean" ? (
                            row.enterprise ? (
                              <Check className="w-4 h-4 text-primary mx-auto" />
                            ) : (
                              <X className="w-4 h-4 text-muted-foreground/50 mx-auto" />
                            )
                          ) : (
                            <span className="text-sm">{row.enterprise}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>

          {/* FAQ or note */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-center mt-16"
          >
            <p className="text-muted-foreground">
              All plans include SSL, 99.9% uptime SLA, and 24/7 monitoring.{" "}
              <Link to="/#features" className="text-primary hover:underline">
                See all features →
              </Link>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border/50">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <BrandLogo variant="header" />
            <p className="text-muted-foreground text-sm">
              © 2025 Link Harbour. Built with ❤️ on AWS.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
