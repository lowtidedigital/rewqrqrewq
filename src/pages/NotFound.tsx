import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Anchor } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6">
          <Anchor className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="mb-2 font-display text-6xl font-bold gradient-text">404</h1>
        <p className="mb-6 text-xl text-muted-foreground">This link has drifted away from the harbour.</p>
        <Button variant="hero" asChild>
          <Link to="/">Return Home</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
