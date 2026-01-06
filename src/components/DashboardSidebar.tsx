import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Link2, 
  BarChart3, 
  Settings, 
  LogOut,
  Plus,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Logo from "@/components/Logo";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const sidebarLinks = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Link2, label: "Links", path: "/dashboard/links" },
  { icon: BarChart3, label: "Analytics", path: "/dashboard/analytics" },
  { icon: CreditCard, label: "Billing", path: "/dashboard/billing" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

// Shared Brand Header Component
const BrandHeader = ({ collapsed = false, size = "lg" }: { collapsed?: boolean; size?: "md" | "lg" }) => (
  <div className={cn(
    "flex flex-col",
    collapsed ? "items-center py-4 px-2" : "p-5"
  )}>
    <Link to="/dashboard" className="flex items-center group">
      <Logo 
        showText={!collapsed} 
        size={size}
        className={cn(
          "transition-all duration-200",
          !collapsed && "hover:opacity-90"
        )}
      />
    </Link>
    {!collapsed && (
      <p className="text-xs text-sidebar-foreground/50 mt-1.5 pl-0.5">
        Fast short links
      </p>
    )}
  </div>
);

// Shared Navigation Component
const NavigationLinks = ({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) => {
  const location = useLocation();
  
  return (
    <nav className="flex-1 py-3 px-3 space-y-1">
      {sidebarLinks.map((link) => {
        const isActive = location.pathname === link.path || 
          (link.path !== "/dashboard" && location.pathname.startsWith(link.path));
        
        return (
          <Link
            key={link.path}
            to={link.path}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
              isActive
                ? "bg-sidebar-accent text-sidebar-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}
          >
            <link.icon className={cn(
              "w-5 h-5 flex-shrink-0 transition-colors",
              isActive ? "text-sidebar-primary" : "group-hover:text-sidebar-primary"
            )} />
            {!collapsed && (
              <span className="font-medium">{link.label}</span>
            )}
            {isActive && (
              <motion.div
                layoutId="sidebar-active"
                className="absolute left-0 w-1 h-6 bg-sidebar-primary rounded-r-full"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
};

// Desktop Sidebar
const DashboardSidebar = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "fixed left-0 top-0 bottom-0 z-40 hidden md:flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
          collapsed ? "w-[72px]" : "w-64"
        )}
      >
        {/* Brand Header */}
        <div className="border-b border-sidebar-border/50 bg-sidebar-accent/30">
          <div className="flex items-center justify-between">
            <BrandHeader collapsed={collapsed} size={collapsed ? "md" : "lg"} />
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={cn(
                "p-2 rounded-md hover:bg-sidebar-accent text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors",
                collapsed ? "mx-auto" : "mr-3"
              )}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Create Link Button */}
        <div className="p-3">
          <Button 
            variant="hero" 
            className={cn("w-full", collapsed && "px-0 justify-center")}
            asChild
          >
            <Link to="/dashboard/links/new">
              <Plus className="w-4 h-4" />
              {!collapsed && <span>Create Link</span>}
            </Link>
          </Button>
        </div>

        {/* Navigation */}
        <NavigationLinks collapsed={collapsed} />

        {/* Footer */}
        <div className="p-3 border-t border-sidebar-border">
          <button
            onClick={handleSignOut}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors",
              collapsed && "justify-center"
            )}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="font-medium">Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Sidebar Trigger (visible on mobile only) */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-background/95 backdrop-blur-sm border-b border-border flex items-center px-4">
        <MobileSidebar onSignOut={handleSignOut} />
        <div className="flex-1 flex justify-center">
          <Link to="/dashboard">
            <Logo size="md" showText={true} />
          </Link>
        </div>
        <div className="w-10" /> {/* Spacer for balance */}
      </div>
    </>
  );
};

// Mobile Sidebar (Sheet)
const MobileSidebar = ({ onSignOut }: { onSignOut: () => void }) => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="w-6 h-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 bg-sidebar border-sidebar-border">
        {/* Brand Header */}
        <div className="border-b border-sidebar-border/50 bg-sidebar-accent/30">
          <BrandHeader collapsed={false} size="lg" />
        </div>

        {/* Create Link Button */}
        <div className="p-4">
          <Button 
            variant="hero" 
            className="w-full"
            asChild
            onClick={() => setOpen(false)}
          >
            <Link to="/dashboard/links/new">
              <Plus className="w-4 h-4" />
              <span>Create Link</span>
            </Link>
          </Button>
        </div>

        {/* Navigation */}
        <NavigationLinks collapsed={false} onNavigate={() => setOpen(false)} />

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border mt-auto">
          <button
            onClick={() => {
              setOpen(false);
              onSignOut();
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default DashboardSidebar;
