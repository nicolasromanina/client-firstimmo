import React from "react";
import { useLocation, Link } from "react-router-dom";
import { LayoutGrid, Bell, BarChart3, MessageCircle, CalendarDays, Star, FileText } from "lucide-react";
import userIcon from "@/assets/user-icon.svg";
import projectIcon from "@/assets/project-icon.svg";
import documentIcon from "@/assets/document-icon.svg";
import partnerIcon from "@/assets/partenaire-icon.svg";
import settingsIcon from "@/assets/setting-icon.svg";

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
        {React.isValidElement(icon)
          ? React.cloneElement(icon as React.ReactElement, {
              className: `${(icon as any).props.className ?? ""} ${isActive ? (typeof (icon as any).type === "string" && (icon as any).type === "img" ? "filter invert brightness-200" : "text-white") : ""}`.trim(),
            })
          : icon}
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
    { icon: <img src={userIcon} alt="Mon profil" className="w-5 h-5" />, label: "Mon profil", to: "/profile" },
    { icon: <img src={projectIcon} alt="Projets" className="w-5 h-5" />, label: "Projets", to: "/projets" },
    { icon: <BarChart3 className="w-5 h-5" />, label: "Comparer", to: "/comparer" },
    { icon: <MessageCircle className="w-5 h-5" />, label: "Messages", to: "/messages" },
    { icon: <CalendarDays className="w-5 h-5" />, label: "Rendez-vous", to: "/rendez-vous" },
    { icon: <Star className="w-5 h-5" />, label: "Mes avis", to: "/avis" },
    { icon: <Bell className="w-5 h-5" />, label: "Alertes", to: "/alertes" },
    { icon: <FileText className="w-5 h-5" />, label: "Brochures", to: "/brochures" },
    { icon: <img src={documentIcon} alt="Documents" className="w-5 h-5" />, label: "Documents", to: "/documents" },
    { icon: <img src={partnerIcon} alt="Partenaires" className="w-5 h-5" />, label: "Partenaires", to: "/partenaires" },
  ];

    const isActive = (path: string) => {
    if (path === "/profile") {
      return location.pathname === "/profile" || location.pathname === "/profil/edit";
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
          icon={<img src={settingsIcon} alt="Paramètres" className="w-5 h-5" />}
          label="Paramètres"
          to="/parametres"
          isActive={isActive("/parametres")}
        />
      </div>
    </aside>
  );
};

export default Sidebar;
