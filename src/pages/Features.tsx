import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import BrandLogo from "@/components/BrandLogo";
import { 
  Link2, 
  QrCode, 
  BarChart3, 
  Shield, 
  Globe,
  ArrowRight,
  Check,
  Code,
  Zap,
  Tags,
  Clock,
  Smartphone,
  PieChart,
  Lock,
  Server,
  Webhook,
} from "lucide-react";

const coreFeatures = [
  {
    icon: Link2,
    title: "Lightning Fast Links",
    description: "Create short links in seconds with custom slugs, titles, and tags. Our infrastructure ensures blazing-fast redirects under 50ms.",
  },
  {
    icon: QrCode,
    title: "QR Codes Included",
    description: "Every link comes with a beautiful QR code. Download as PNG or SVG, perfect for print and digital campaigns.",
  },
  {
    icon: BarChart3,
    title: "Powerful Analytics",
    description: "Track clicks, referrers, locations, and devices. Make data-driven decisions with real-time insights.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Built with encryption at rest, secure authentication, and least-privilege access controls. Your data is safe.",
  },
  {
    icon: Globe,
    title: "Global CDN",
    description: "Edge locations worldwide ensure your links load instantly, no matter where your audience is.",
  },
  {
    icon: Code,
    title: "Developer Friendly",
    description: "RESTful API with full documentation. Integrate short links into your apps seamlessly.",
  },
];

const advancedFeatures = [
  {
    icon: Tags,
    title: "Smart Tagging",
    description: "Organize links with custom tags and categories for easy filtering and management.",
  },
  {
    icon: Clock,
    title: "Link Expiration",
    description: "Set automatic expiration dates for time-sensitive campaigns and promotions.",
  },
  {
    icon: Smartphone,
    title: "Mobile Optimized",
    description: "Full responsive dashboard that works beautifully on any device.",
  },
  {
    icon: PieChart,
    title: "Custom Reports",
    description: "Generate detailed reports with date ranges and export to CSV.",
  },
  {
    icon: Lock,
    title: "Password Protection",
    description: "Add password protection to sensitive links for extra security.",
  },
  {
    icon: Webhook,
    title: "Webhooks",
    description: "Get real-time notifications when links are clicked via webhooks.",
  },
];

const comparisonPoints = [
  { feature: "Custom short links", us: true, others: "Limited" },
  { feature: "QR code generation", us: true, others: "Paid addon" },
  { feature: "Real-time analytics", us: true, others: true },
  { feature: "API access", us: true, others: "Enterprise only" },
  { feature: "Bulk link creation", us: true, others: "Limited" },
  { feature: "Link expiration", us: true, others: "Paid plans" },
  { feature: "No link limits (paid)", us: true, others: false },
  { feature: "24/7 uptime monitoring", us: true, others: true },
];

const Features = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse-glow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[128px] animate-pulse-glow" style={{ animationDelay: "1s" }} />
        </div>

        <div className="container mx-auto relative">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Feature-Rich Platform
            </div>
            
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Everything You Need to{" "}
              <span className="gradient-text">Manage Links</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              A complete URL management platform with powerful features for individuals, marketers, and enterprise teams.
            </p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button variant="hero" size="xl" asChild>
                <Link to="/auth?mode=signup">
                  Start For Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="hero-outline" size="xl" asChild>
                <Link to="/pricing">View Pricing</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-24 px-4 border-t border-border/50">
        <div className="container mx-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Core Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The essential tools you need to create, manage, and track your short links.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group relative p-6 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all duration-300"
              >
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/5 to-transparent" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Features Section */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="container mx-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Advanced Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Power-user features for teams and enterprises who need more control.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {advancedFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group relative p-6 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all duration-300"
              >
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/5 to-transparent" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Why Choose Us?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See how Link Harbour compares to other URL shorteners.
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-border bg-card overflow-hidden"
          >
            <div className="grid grid-cols-3 bg-muted/50 font-semibold">
              <div className="p-4 border-b border-border">Feature</div>
              <div className="p-4 border-b border-l border-border text-center text-primary">Link Harbour</div>
              <div className="p-4 border-b border-l border-border text-center text-muted-foreground">Others</div>
            </div>
            {comparisonPoints.map((point, index) => (
              <div key={point.feature} className={`grid grid-cols-3 ${index !== comparisonPoints.length - 1 ? 'border-b border-border' : ''}`}>
                <div className="p-4 text-sm md:text-base">{point.feature}</div>
                <div className="p-4 border-l border-border text-center">
                  {point.us === true ? (
                    <Check className="w-5 h-5 text-primary mx-auto" />
                  ) : (
                    <span className="text-muted-foreground">{point.us}</span>
                  )}
                </div>
                <div className="p-4 border-l border-border text-center">
                  {point.others === true ? (
                    <Check className="w-5 h-5 text-muted-foreground mx-auto" />
                  ) : point.others === false ? (
                    <span className="text-destructive">✕</span>
                  ) : (
                    <span className="text-muted-foreground text-sm">{point.others}</span>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl gradient-primary p-12 md:p-16 text-center"
          >
            <div className="absolute inset-0 bg-grid-pattern bg-[size:30px_30px] opacity-10" />
            <div className="relative">
              <h2 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-primary-foreground/80 mb-8 max-w-xl mx-auto">
                Join thousands of users who trust Link Harbour for their link management needs.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button variant="glass" size="xl" className="bg-white/20 hover:bg-white/30 text-white border-white/30" asChild>
                  <Link to="/auth?mode=signup">
                    Get Started Free
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
              </div>
              <div className="flex items-center justify-center gap-6 mt-8 text-primary-foreground/80">
                {["No credit card required", "Free forever plan", "Setup in 30 seconds"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border/50">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <BrandLogo variant="header" linkTo="/" />
            <div className="flex flex-col items-center md:items-end gap-1 text-sm">
              <p className="text-muted-foreground">
                © 2026 Link Harbour.
              </p>
              <a 
                href="https://www.lowtidedigital.ca" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors group inline-flex items-center gap-1.5"
              >
                A product by{" "}
                <span className="font-medium text-foreground group-hover:text-primary underline underline-offset-2 decoration-primary/50">
                  Lowtide Digital
                </span>
                <img src="/lowtide-logo.png" alt="Lowtide Digital" className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Features;
