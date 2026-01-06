import linkHarbourLogo from "@/assets/link-harbour-logo.png";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface BrandLogoProps {
  variant?: "drawer" | "sidebarExpanded" | "sidebarCollapsed" | "header" | "authPanel";
  linkTo?: string;
  className?: string;
}

const variantConfig = {
  drawer: {
    containerClass: "pt-6 pb-5 px-5",
    plateClass: "rounded-2xl bg-card/40 border border-border/50 shadow-sm p-5",
    imageClass: "h-[100px] w-auto",
    scale: "scale-[1.8]", // Aggressive scale to overcome transparent padding
    wrapperClass: "overflow-hidden flex items-center justify-center h-[100px]",
  },
  sidebarExpanded: {
    containerClass: "pt-5 pb-4 px-4",
    plateClass: "rounded-2xl bg-card/40 border border-border/50 shadow-sm p-4",
    imageClass: "h-[80px] w-auto",
    scale: "scale-[1.6]",
    wrapperClass: "overflow-hidden flex items-center justify-center h-[80px]",
  },
  sidebarCollapsed: {
    containerClass: "py-3 px-2",
    plateClass: "rounded-xl bg-card/40 border border-border/50 p-2",
    imageClass: "h-[48px] w-[48px]",
    scale: "scale-[1.5]",
    wrapperClass: "overflow-hidden flex items-center justify-center h-[48px] w-[48px]",
  },
  header: {
    containerClass: "",
    plateClass: "",
    imageClass: "h-[48px] w-auto",
    scale: "scale-[1.6]",
    wrapperClass: "overflow-hidden flex items-center justify-center h-[48px]",
  },
  authPanel: {
    containerClass: "",
    plateClass: "rounded-2xl bg-white/10 border border-white/20 shadow-lg p-4",
    imageClass: "h-[72px] w-auto",
    scale: "scale-[1.6]",
    wrapperClass: "overflow-hidden flex items-center justify-center h-[72px]",
  },
};

const BrandLogo = ({ variant = "sidebarExpanded", linkTo, className }: BrandLogoProps) => {
  const config = variantConfig[variant];
  
  const logoContent = (
    <div className={cn(config.containerClass, className)}>
      {config.plateClass ? (
        <div className={config.plateClass}>
          <div className={config.wrapperClass}>
            <img 
              src={linkHarbourLogo} 
              alt="Link Harbour" 
              className={cn(config.imageClass, config.scale, "object-contain")}
            />
          </div>
        </div>
      ) : (
        <div className={config.wrapperClass}>
          <img 
            src={linkHarbourLogo} 
            alt="Link Harbour" 
            className={cn(config.imageClass, config.scale, "object-contain")}
          />
        </div>
      )}
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
