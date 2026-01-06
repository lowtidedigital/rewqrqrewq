import { Outlet } from "react-router-dom";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop: CSS Grid layout for sidebar + content */}
      <div className="hidden md:grid md:grid-cols-[auto_1fr] min-h-screen">
        <DashboardSidebar />
        <div className="flex flex-col min-w-0">
          <DashboardHeader />
          <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile: stacked layout with fixed header */}
      <div className="md:hidden">
        <DashboardSidebar />
        <div className="pt-16">
          <main className="p-4">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
