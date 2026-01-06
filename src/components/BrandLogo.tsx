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
    imageClass: "h-20 max-w-[220px]", // Large for sidebar with whitespace
    container: "px-3 py-3",
    showContainer: true,
  },
  drawer: {
    imageClass: "h-24 max-w-[260px]", // Larger for mobile drawer
    container: "px-3 py-4",
    showContainer: true,
  },
  header: {
    imageClass: "h-12 max-w-[180px]", // Bigger for navbar visibility
    container: "",
    showContainer: false,
  },
  collapsed: {
    imageClass: "h-12 w-12", // Square for collapsed
    container: "p-1",
    showContainer: true,
  },
};

const BrandLogo = ({ variant = "sidebar", linkTo, className }: BrandLogoProps) => {
  const config = variantConfig[variant];
  
  const logoContent = (
    <div 
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
};

export default BrandLogo;
