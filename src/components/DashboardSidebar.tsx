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
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const sidebarLinks = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Link2, label: "Links", path: "/dashboard/links" },
  { icon: BarChart3, label: "Analytics", path: "/dashboard/analytics" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

const DashboardSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "fixed left-0 top-0 bottom-0 z-40 flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <Logo showText={!collapsed} size="sm" />
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Create Link Button */}
      <div className="p-3">
        <Button 
          variant="hero" 
          className={cn("w-full", collapsed && "px-0")}
          asChild
        >
          <Link to="/dashboard/links/new">
            <Plus className="w-4 h-4" />
            {!collapsed && <span>Create Link</span>}
          </Link>
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {sidebarLinks.map((link) => {
          const isActive = location.pathname === link.path || 
            (link.path !== "/dashboard" && location.pathname.startsWith(link.path));
          
          return (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
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
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-medium"
                >
                  {link.label}
                </motion.span>
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

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={handleSignOut}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium">Sign Out</span>}
        </button>
      </div>
    </motion.aside>
  );
};

export default DashboardSidebar;
