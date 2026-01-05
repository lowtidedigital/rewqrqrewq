import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { Check, Anchor, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Starter",
    price: "$0",
    period: "forever",
    description: "Perfect for personal projects and testing",
    features: [
      "50 short links",
      "1,000 clicks/month",
      "Basic analytics",
      "QR codes (PNG only)",
      "7-day link history",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Professional",
    price: "$12",
    period: "per month",
    description: "For professionals and growing teams",
    features: [
      "Unlimited short links",
      "100,000 clicks/month",
      "Advanced analytics",
      "QR codes (PNG + SVG)",
      "Custom slugs",
      "Link expiration",
      "API access",
      "Priority support",
    ],
    cta: "Start Pro Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact us",
    description: "For large organisations with custom needs",
    features: [
      "Everything in Professional",
      "Unlimited clicks",
      "Custom domain",
      "SSO / SAML",
      "Dedicated support",
      "SLA guarantee",
      "Custom integrations",
      "Team management",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const Pricing = () => {
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
              Start free, scale as you grow. No hidden fees, no surprises.
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={cn(
                  "relative rounded-2xl border bg-card p-8 flex flex-col",
                  plan.popular
                    ? "border-primary shadow-xl shadow-primary/10 scale-105"
                    : "border-border"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-1 px-4 py-1.5 rounded-full gradient-primary text-primary-foreground text-sm font-medium">
                      <Star className="w-4 h-4" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="font-display text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-5xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                  <p className="text-muted-foreground mt-2">{plan.description}</p>
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
                  asChild
                >
                  <Link to="/auth?mode=signup">{plan.cta}</Link>
                </Button>
              </motion.div>
            ))}
          </div>

          {/* FAQ or note */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
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
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Anchor className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl">LinkHarbour</span>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2025 LinkHarbour. Built with ❤️ on AWS.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
