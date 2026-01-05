import linkHarbourLogo from "@/assets/link-harbour-logo.png";
import { cn } from "@/lib/utils";

interface LogoProps {
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-7 w-auto",
  md: "h-9 w-auto",
  lg: "h-12 w-auto",
};

const Logo = ({ showText = true, size = "md", className }: LogoProps) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <img 
        src={linkHarbourLogo} 
        alt="LinkHarbour" 
        className={cn(sizeClasses[size], "object-contain")}
      />
      {showText && (
        <span className="font-display font-bold text-xl">
          LinkHarbour
        </span>
      )}
    </div>
  );
};

export default Logo;
