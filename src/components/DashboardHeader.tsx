import { motion } from "framer-motion";
import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

const DashboardHeader = () => {
  const { user } = useAuth();
  
  // Get display name - use name if available, otherwise first part of email
  const displayName = user?.name || user?.email?.split('@')[0] || "User";
  
  // Get initials for avatar
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="h-16 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-30"
    >
      <div className="h-full px-6 flex items-center justify-between">
        {/* Search */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search links, analytics..."
            className="pl-10 bg-secondary/50 border-border/50 focus:bg-secondary"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
          </Button>
          
          <div className="w-px h-6 bg-border" />
          
          <Button variant="ghost" className="gap-2">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
              <span className="text-xs font-bold text-primary-foreground">{initials}</span>
            </div>
            <span className="hidden sm:inline text-sm font-medium">{displayName}</span>
          </Button>
        </div>
      </div>
    </motion.header>
  );
};

export default DashboardHeader;