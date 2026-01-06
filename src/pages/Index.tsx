import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { 
  Anchor, 
  Link2, 
  QrCode, 
  BarChart3, 
  Shield, 
  Globe,
  ArrowRight,
  Check,
  Sparkles
} from "lucide-react";

const features = [
  {
    icon: Link2,
    title: "Lightning Fast Links",
    description: "Create short links in seconds with custom slugs, titles, and tags. Our AWS infrastructure ensures blazing-fast redirects.",
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
    description: "Built on AWS with DynamoDB encryption, Cognito auth, and least-privilege IAM. Your data is safe.",
  },
  {
    icon: Globe,
    title: "Global CDN",
    description: "CloudFront edge locations worldwide ensure your links load instantly, no matter where your audience is.",
  },
  {
    icon: Sparkles,
    title: "Developer Friendly",
    description: "RESTful API with TypeScript SDK. Integrate short links into your apps and workflows seamlessly.",
  },
];

const stats = [
  { value: "99.99%", label: "Uptime" },
  { value: "<50ms", label: "Redirect Latency" },
  { value: "1B+", label: "Links Shortened" },
  { value: "150+", label: "Countries Served" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse-glow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[128px] animate-pulse-glow" style={{ animationDelay: "1s" }} />
          <div className="absolute inset-0 bg-grid-pattern bg-[size:50px_50px] opacity-5" />
        </div>

        <div className="container mx-auto relative">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium mb-8"
            >
              <Anchor className="w-4 h-4" />
              Powered by AWS Serverless
            </motion.div>

            {/* Headline */}
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Fast short links.{" "}
              <span className="gradient-text">Trusted tracking.</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              The fastest, most reliable URL shortener built on AWS. 
              Create branded links, generate QR codes, and track every click.
            </p>

            {/* CTA Buttons */}
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

            {/* Social Proof */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-12 flex items-center justify-center gap-6"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-background gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1 text-warning">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">Loved by 50,000+ marketers</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 border-y border-border/50">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="text-center"
              >
                <p className="font-display text-4xl md:text-5xl font-bold gradient-text mb-2">
                  {stat.value}
                </p>
                <p className="text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A complete URL management platform with powerful features for individuals and teams.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
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
                Ready to Shorten Your First Link?
              </h2>
              <p className="text-xl text-primary-foreground/80 mb-8 max-w-xl mx-auto">
                Join thousands of marketers and developers who trust Link Harbour for their link management.
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
            <div className="flex items-center gap-2">
              <img src="/favicon.png" alt="Link Harbour" className="w-8 h-8" />
            </div>
            <p className="text-muted-foreground text-sm">
              © 2025 Link Harbour. Built with ❤️ on AWS.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
