import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { config, buildAppUrl } from "@/config";
import BrandLogo from "@/components/BrandLogo";

const NotFound = () => {
  const location = useLocation();
  const [isShortLinkRoute, setIsShortLinkRoute] = useState(false);
  const [extractedSlug, setExtractedSlug] = useState<string | null>(null);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    
    // Check if this is a short link route (e.g., /r/abc123)
    const shortLinkMatch = location.pathname.match(/^\/r\/([^/]+)$/);
    if (shortLinkMatch) {
      setIsShortLinkRoute(true);
      setExtractedSlug(shortLinkMatch[1]);
    }
  }, [location.pathname]);

  // Special handling for short link routes on the app domain
  if (isShortLinkRoute && extractedSlug) {
    const correctShortUrl = `https://${config.shortDomain}/r/${extractedSlug}`;
    
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center max-w-md px-4">
          <div className="mx-auto mb-6">
            <BrandLogo variant="header" />
          </div>
          <h1 className="mb-2 font-display text-3xl font-bold">Short Links Live Elsewhere</h1>
          <p className="mb-6 text-muted-foreground">
            Short links are served from <strong>{config.shortDomain}</strong>, not the app domain.
          </p>
          <div className="p-4 rounded-xl bg-secondary/50 border border-border mb-6">
            <p className="text-sm text-muted-foreground mb-2">Your short link:</p>
            <code className="text-primary font-mono break-all">{correctShortUrl}</code>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button variant="hero" asChild>
              <a href={correctShortUrl} target="_blank" rel="noopener noreferrer">
                Open Short Link
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/">Return Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Standard 404 page
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center max-w-md px-4">
        <div className="mx-auto mb-6">
          <BrandLogo variant="header" />
        </div>
        <h1 className="mb-2 font-display text-6xl font-bold gradient-text">404</h1>
        <p className="mb-6 text-xl text-muted-foreground">This link has drifted away from the harbour.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button variant="hero" asChild>
            <Link to="/">Return Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <a href={buildAppUrl('/dashboard/links/new')}>
              Create Your Own Link
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
