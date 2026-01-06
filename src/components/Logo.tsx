import linkHarbourLogo from "@/assets/link-harbour-logo.png";
import { cn } from "@/lib/utils";

interface LogoProps {
  showText?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  textClassName?: string;
}

const sizeConfig = {
  xs: {
    image: "h-6 w-auto",
    text: "text-sm",
    gap: "gap-1.5",
  },
  sm: {
    image: "h-8 w-auto",
    text: "text-base",
    gap: "gap-2",
  },
  md: {
    image: "h-10 w-auto",
    text: "text-lg",
    gap: "gap-2",
  },
  lg: {
    image: "h-12 w-auto",
    text: "text-xl",
    gap: "gap-3",
  },
  xl: {
    image: "h-14 w-auto",
    text: "text-2xl",
    gap: "gap-3",
  },
};

const Logo = ({ showText = true, size = "md", className, textClassName }: LogoProps) => {
  const config = sizeConfig[size];
  
  return (
    <div className={cn("flex items-center", config.gap, className)}>
      <img 
        src={linkHarbourLogo} 
        alt="Link Harbour" 
        className={cn(config.image, "object-contain flex-shrink-0")}
      />
      {showText && (
        <span className={cn(
          "font-display font-bold whitespace-nowrap",
          config.text,
          textClassName
        )}>
          Link Harbour
        </span>
      )}
    </div>
  );
};

export default Logo;
