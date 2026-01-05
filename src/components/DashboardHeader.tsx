import { motion } from "framer-motion";
import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DashboardHeader = () => {
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
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full animate-pulse" />
          </Button>
          
          <div className="w-px h-6 bg-border" />
          
          <Button variant="ghost" className="gap-2">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
              <User className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="hidden sm:inline text-sm font-medium">Demo User</span>
          </Button>
        </div>
      </div>
    </motion.header>
  );
};

export default DashboardHeader;
