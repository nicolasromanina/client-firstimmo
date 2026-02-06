import { useLocation, Link } from "react-router-dom";
import { LayoutGrid, Users, Image, FileText, RefreshCw, Settings, User, FolderKanban } from "lucide-react";

/**
 * Sidebar de navigation principale
 * - Navigation avec icônes et labels
 * - Item actif avec fond noir et texte blanc
 * - Style carte blanche arrondie
 */

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  isActive: boolean;
}

const NavItem = ({ icon, label, to, isActive }: NavItemProps) => {
  return (
    <Link
      to={to}
      className={`
        flex items-center gap-3 px-5 py-3 rounded-full transition-all duration-200
        text-[15px] font-medium
        ${isActive 
          ? "bg-[#1a1a1a] text-white dark:bg-white dark:text-gray-900" 
          : "text-[#1a1a1a] hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
        }
      `}
    >
      <span className="w-5 h-5 flex items-center justify-center">
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  );
};

const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Items de navigation principaux
  const mainNavItems = [
    { icon: <LayoutGrid className="w-5 h-5" />, label: "Tableau de bord", to: "/" },
    { icon: <User className="w-5 h-5" />, label: "Mon profil", to: "/profil" },
    { icon: <FolderKanban className="w-5 h-5" />, label: "Projets", to: "/projets" },
    { icon: <FileText className="w-5 h-5" />, label: "Documents", to: "/documents" },
    { icon: <Users className="w-5 h-5" />, label: "Partenaires", to: "/partenaires" },
  ];

    const isActive = (path: string) => {
    if (path === "/profil") {
      return location.pathname === "/profil" || location.pathname === "/profil/edit";
    }
    return location.pathname === path;
  };

  return (
    <aside
      className="
        bg-white dark:bg-gray-800 rounded-3xl shadow-sm dark:shadow-gray-900/30
        flex flex-col justify-between
        p-4 h-fit
        min-w-[220px] max-w-[260px]
        lg:min-w-[240px]
        md:min-w-[200px]
        transition-colors duration-300
      "
    >
      {/* Navigation principale */}
      <nav className="flex flex-col gap-1">
        {mainNavItems.map((item) => (
          <NavItem
            key={item.to}
            icon={item.icon}
            label={item.label}
            to={item.to}
            isActive={isActive(item.to)}
          />
        ))}
      </nav>

      {/* Séparateur + Paramètres */}
      <div className="mt-48">
        <NavItem
          icon={<Settings className="w-5 h-5" />}
          label="Paramètres"
          to="/parametres"
          isActive={isActive("/parametres")}
        />
      </div>
    </aside>
  );
};

export default Sidebar;
