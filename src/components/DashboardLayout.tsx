import { Outlet } from "react-router-dom";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      {/* Desktop: offset for sidebar. Mobile: offset for top header */}
      <div className="md:pl-64 pt-16 md:pt-0 transition-all duration-300">
        <DashboardHeader />
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
