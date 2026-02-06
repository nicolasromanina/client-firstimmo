import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, User, FolderKanban, FileText, Users, Settings, Menu, X } from "lucide-react";
import { useState } from "react";

/**
 * Sidebar Component
 * Navigation latérale avec menu responsive
 * Reproduit pixel-perfect le design fourni
 */

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

const NavItem = ({ to, icon, label, isActive, onClick }: NavItemProps) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center gap-3 px-6 py-3.5 rounded-xl font-medium text-sm transition-all ${
      isActive
        ? "bg-slate-900 text-white"
        : "text-slate-700 hover:bg-slate-100"
    }`}
  >
    {icon}
    <span>{label}</span>
  </Link>
);

const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Navigation items configuration
  const navItems = [
    { to: "/", icon: <LayoutDashboard size={20} />, label: "Tableau de bord" },
    { to: "/profil", icon: <User size={20} />, label: "Mon profil" },
    { to: "/projets", icon: <FolderKanban size={20} />, label: "Mes projets" },
    { to: "/documents", icon: <FileText size={20} />, label: "Documents" },
    { to: "/partenaires", icon: <Users size={20} />, label: "Partenaires" },
  ];

  const isActive = (path: string) => {
    if (path === "/profil") {
      return location.pathname === "/profil" || location.pathname === "/profil/edit";
    }
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:static top-0 left-0 h-full z-40 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between p-4 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } w-64 min-w-64`}
      >
        {/* Navigation principale */}
        <nav className="flex flex-col gap-1 pt-8 lg:pt-0">
          {navItems.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              isActive={isActive(item.to)}
              onClick={() => setIsOpen(false)}
            />
          ))}
        </nav>

        {/* Paramètres en bas */}
        <div className="pb-4">
          <NavItem
            to="/parametres"
            icon={<Settings size={20} />}
            label="Paramètres"
            isActive={location.pathname === "/parametres"}
            onClick={() => setIsOpen(false)}
          />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
