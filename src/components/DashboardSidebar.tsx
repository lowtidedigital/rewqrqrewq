import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import BrandLogo from "@/components/BrandLogo";
import { cn } from "@/lib/utils";
import { useState, createContext, useContext } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";

// Sidebar context for sharing collapsed state with layout
interface SidebarContextType {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({
  collapsed: false,
  setCollapsed: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

const sidebarLinks = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Link2, label: "Links", path: "/dashboard/links" },
  { icon: BarChart3, label: "Analytics", path: "/dashboard/analytics" },
  { icon: CreditCard, label: "Billing", path: "/dashboard/billing" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

// Navigation with tooltips for collapsed state
const NavigationLinks = ({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) => {
  const location = useLocation();
  
  return (
    <TooltipProvider delayDuration={0}>
      <nav className="flex-1 py-3 px-3 space-y-1">
        {sidebarLinks.map((link) => {
          const isActive = location.pathname === link.path || 
            (link.path !== "/dashboard" && location.pathname.startsWith(link.path));
          
          const navItem = (
            <Link
              to={link.path}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                collapsed && "justify-center px-2",
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
          
          if (collapsed) {
            return (
              <Tooltip key={link.path}>
                <TooltipTrigger asChild>
                  <div>{navItem}</div>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {link.label}
                </TooltipContent>
              </Tooltip>
            );
          }
          
          return <div key={link.path}>{navItem}</div>;
        })}
      </nav>
    </TooltipProvider>
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
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "hidden md:flex flex-col bg-sidebar border-r border-sidebar-border h-screen sticky top-0 transition-all duration-300 ease-in-out overflow-hidden",
          collapsed ? "w-[68px]" : "w-[260px]"
        )}
      >
        {/* Brand Header */}
        <div className="border-b border-sidebar-border/50 bg-sidebar-accent/30">
          <div className={cn(
            "flex items-center p-3 min-h-[64px]",
            collapsed ? "justify-center" : "justify-between"
          )}>
            {!collapsed && (
              <BrandLogo 
                variant="sidebar" 
                linkTo="/dashboard"
              />
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={cn(
                "p-2 rounded-md hover:bg-sidebar-accent text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors",
                collapsed && "mx-auto"
              )}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Separator className="bg-sidebar-border/30" />

        {/* Create Link Button */}
        <div className="p-3">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
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
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right" sideOffset={8}>
                  Create Link
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Navigation */}
        <NavigationLinks collapsed={collapsed} />

        {/* Footer */}
        <div className="p-3 border-t border-sidebar-border">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleSignOut}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <LogOut className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span className="font-medium">Sign Out</span>}
                </button>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right" sideOffset={8}>
                  Sign Out
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </motion.aside>

      {/* Mobile Header with Trigger */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-background/95 backdrop-blur-sm border-b border-border flex items-center px-4">
        <MobileSidebar onSignOut={handleSignOut} />
        <div className="flex-1 flex justify-center">
          <BrandLogo variant="header" linkTo="/dashboard" />
        </div>
        <div className="w-10" />
      </div>
    </SidebarContext.Provider>
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
        <div className="border-b border-sidebar-border/50 bg-sidebar-accent/30 p-4">
          <BrandLogo variant="drawer" linkTo="/dashboard" />
        </div>

        <Separator className="bg-sidebar-border/30" />

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
