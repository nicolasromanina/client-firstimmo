import { ReactNode } from "react";
import Sidebar from "../Sidebar";
import Footer from "../Footer";

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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header moved to App.tsx so it's rendered for all routes */}

      {/* Mobile sidebar button is rendered in the Header (inline) to avoid duplicate buttons */}

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="p-4 hidden lg:block">
          <Sidebar />
        </aside>

        {/* Main content area */}
        <main className="flex-1 p-4 lg:p-6 pt-16 lg:pt-6 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      <div className="mt-8">
        <Footer />
      </div>
    </div>
  );
};

export default DashboardLayout;
