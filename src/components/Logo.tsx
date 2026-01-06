import linkHarbourLogo from "@/assets/link-harbour-logo.png";
import { cn } from "@/lib/utils";

interface LogoProps {
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-10 w-auto",
  md: "h-12 w-auto",
  lg: "h-16 w-auto",
};

const Logo = ({ showText = true, size = "md", className }: LogoProps) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <img 
        src={linkHarbourLogo} 
        alt="Link Harbour" 
        className={cn(sizeClasses[size], "object-contain")}
      />
      {showText && (
        <span className="font-display font-bold text-xl">
          Link Harbour
        </span>
      )}
    </div>
  );
};

export default Logo;
