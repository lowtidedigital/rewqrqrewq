import { forwardRef } from "react";
import linkHarbourLogo from "@/assets/link-harbour-logo.png";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface BrandLogoProps {
  variant?: "sidebar" | "drawer" | "header" | "collapsed";
  linkTo?: string;
  className?: string;
}

const variantConfig = {
  sidebar: {
    imageClass: "h-12 max-w-[180px]",
    container: "px-3 py-3",
    showContainer: true,
  },
  drawer: {
    imageClass: "h-14 max-w-[200px]",
    container: "px-3 py-3",
    showContainer: true,
  },
  header: {
    imageClass: "h-9 max-w-[150px]",
    container: "",
    showContainer: false,
  },
  collapsed: {
    imageClass: "h-9 w-9",
    container: "p-2",
    showContainer: true,
  },
};

const BrandLogo = forwardRef<HTMLDivElement, BrandLogoProps>(
  ({ variant = "sidebar", linkTo, className }, ref) => {
    const config = variantConfig[variant];
    
    const logoContent = (
      <div 
        ref={ref}
        className={cn(
          "flex items-center justify-center",
          config.showContainer && "rounded-xl bg-card/30 border border-border/40",
          config.container,
          className
        )}
      >
        <img 
          src={linkHarbourLogo} 
          alt="Link Harbour" 
          className={cn(config.imageClass, "w-auto object-contain")}
        />
      </div>
    );
    
    if (linkTo) {
      return (
        <Link to={linkTo} className="block hover:opacity-90 transition-opacity">
          {logoContent}
        </Link>
      );
    }
    
    return logoContent;
  }
);

BrandLogo.displayName = "BrandLogo";

export default BrandLogo;
