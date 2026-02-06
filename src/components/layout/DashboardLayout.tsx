import { ReactNode } from "react";
import Sidebar from "./Sidebar";

/**
 * DashboardLayout Component
 * Layout principal avec sidebar et zone de contenu
 * Gère le responsive pour mobile/tablet/desktop
 */

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="p-4 hidden lg:block">
        <Sidebar />
      </div>
      
      {/* Mobile sidebar (overlay) */}
      <div className="lg:hidden">
        <Sidebar />
      </div>

      {/* Main content area */}
      <main className="flex-1 p-4 lg:p-6 pt-16 lg:pt-6 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
