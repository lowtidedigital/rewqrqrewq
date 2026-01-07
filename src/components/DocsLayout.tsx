import { useState, useMemo } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Search, Menu, X, Book, Rocket, Link2, BarChart3, Shield, HelpCircle, Wrench } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import BrandLogo from "@/components/BrandLogo";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const docsNavigation: NavSection[] = [
  {
    title: "Getting Started",
    items: [
      { title: "Introduction", href: "/docs", icon: Book },
      { title: "Getting Started", href: "/docs/getting-started", icon: Rocket },
    ],
  },
  {
    title: "Features",
    items: [
      { title: "Creating Links", href: "/docs/creating-links", icon: Link2 },
      { title: "Analytics", href: "/docs/analytics", icon: BarChart3 },
      { title: "Security", href: "/docs/security", icon: Shield },
    ],
  },
  {
    title: "Help",
    items: [
      { title: "FAQ", href: "/docs/faq", icon: HelpCircle },
      { title: "Troubleshooting", href: "/docs/troubleshooting", icon: Wrench },
    ],
  },
];

const DocsLayout = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const filteredNavigation = useMemo(() => {
    if (!searchQuery.trim()) return docsNavigation;
    
    const query = searchQuery.toLowerCase();
    return docsNavigation
      .map((section) => ({
        ...section,
        items: section.items.filter((item) =>
          item.title.toLowerCase().includes(query)
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [searchQuery]);

  const currentPage = docsNavigation
    .flatMap((section) => section.items)
    .find((item) => item.href === location.pathname);

  const Sidebar = ({ className = "" }: { className?: string }) => (
    <aside className={`w-64 shrink-0 ${className}`}>
      <div className="sticky top-20 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search docs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card border-border"
          />
        </div>

        {/* Navigation */}
        <nav className="space-y-6">
          {filteredNavigation.map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold text-foreground mb-2">
                {section.title}
              </h4>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        to={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                          isActive
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {item.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Support Link */}
        <div className="pt-4 border-t border-border">
          <Link
            to="/support"
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            Need help? Contact Support
          </Link>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <BrandLogo variant="header" linkTo="/" />
              <span className="text-muted-foreground">/</span>
              <Link to="/docs" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Documentation
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link to="/support" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Support
              </Link>
              <Button variant="hero" size="sm" asChild>
                <Link to="/auth?mode=signup">Get Started</Link>
              </Button>
            </div>

            <button
              className="md:hidden p-2 text-muted-foreground hover:text-foreground"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-background/95 backdrop-blur-sm pt-16 md:hidden overflow-y-auto"
        >
          <div className="p-4">
            <Sidebar />
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex gap-12">
          {/* Desktop Sidebar */}
          <Sidebar className="hidden md:block" />

          {/* Content */}
          <main className="flex-1 min-w-0">
            {/* Breadcrumbs */}
            {currentPage && (
              <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                <Link to="/docs" className="hover:text-foreground transition-colors">
                  Docs
                </Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-foreground">{currentPage.title}</span>
              </nav>
            )}

            <Outlet />
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-4">
        <div className="container mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <Link to="/legal/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link to="/legal/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/legal/acceptable-use" className="hover:text-foreground transition-colors">Acceptable Use</Link>
            <Link to="/legal/cookies" className="hover:text-foreground transition-colors">Cookies</Link>
            <Link to="/legal/data-retention" className="hover:text-foreground transition-colors">Data Retention</Link>
            <Link to="/legal/refunds" className="hover:text-foreground transition-colors">Refunds</Link>
            <Link to="/support" className="hover:text-foreground transition-colors">Support</Link>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">
            © 2026 Link Harbour. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default DocsLayout;
