import { Link, useLocation, Outlet } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import BrandLogo from "@/components/BrandLogo";

interface LegalPage {
  title: string;
  href: string;
}

const legalPages: LegalPage[] = [
  { title: "Terms of Service", href: "/legal/terms" },
  { title: "Privacy Policy", href: "/legal/privacy" },
  { title: "Acceptable Use", href: "/legal/acceptable-use" },
  { title: "Cookies", href: "/legal/cookies" },
  { title: "Data Retention", href: "/legal/data-retention" },
  { title: "Refunds", href: "/legal/refunds" },
];

const LegalLayout = () => {
  const location = useLocation();
  const currentPage = legalPages.find((page) => page.href === location.pathname);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <BrandLogo variant="header" linkTo="/" />
              <span className="text-muted-foreground">/</span>
              <span className="text-sm font-medium text-foreground">Legal</span>
            </div>

            <div className="flex items-center gap-4">
              <Link to="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Docs
              </Link>
              <Link to="/support" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Support
              </Link>
              <Button variant="hero" size="sm" asChild>
                <Link to="/auth?mode=signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex gap-12">
          {/* Sidebar */}
          <aside className="hidden md:block w-56 shrink-0">
            <div className="sticky top-20">
              <h4 className="text-sm font-semibold text-foreground mb-4">Legal</h4>
              <nav className="space-y-1">
                {legalPages.map((page) => {
                  const isActive = location.pathname === page.href;
                  return (
                    <Link
                      key={page.href}
                      to={page.href}
                      className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                        isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      {page.title}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0 max-w-3xl">
            {/* Breadcrumbs */}
            {currentPage && (
              <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                <Link to="/" className="hover:text-foreground transition-colors">
                  Home
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
            <Link to="/docs" className="hover:text-foreground transition-colors">Docs</Link>
            <Link to="/support" className="hover:text-foreground transition-colors">Support</Link>
            <Link to="/legal/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link to="/legal/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">
            © 2026 Link Harbour. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LegalLayout;
