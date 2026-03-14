import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, Link } from "react-router-dom";
import { LayoutGrid, Settings, Menu, X, CalendarDays, Star, BarChart3, MessageCircle, Bell, FileText } from "lucide-react";
import userIcon from "@/assets/user-icon.svg";
import projectIcon from "@/assets/project-icon.svg";
import documentIcon from "@/assets/document-icon.svg";
import partnerIcon from "@/assets/partenaire-icon.svg";
import settingsIcon from "@/assets/setting-icon.svg";
/**
 * Sidebar mobile avec menu hamburger
 * Overlay slide-in pour les écrans mobiles
 */

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem = React.forwardRef<HTMLAnchorElement, NavItemProps>(({ icon, label, to, isActive, onClick }, ref) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      role="menuitem"
      aria-current={isActive ? "page" : undefined}
      ref={ref}
      className={`
        w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200
        text-[14px] font-medium touch-manipulation
        ${isActive ? "bg-[#1a1a1a] text-white dark:bg-white dark:text-gray-900" : "text-[#1a1a1a] hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"}
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
});
NavItem.displayName = "NavItem";

interface MobileSidebarProps {
  inline?: boolean;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({ inline = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;
  const asideRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

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

  const closeSidebar = () => setIsOpen(false);
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null);

  // close on Escape and lock scrolling when sidebar open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!isOpen) return;
      if (asideRef.current && asideRef.current.contains(target)) return;
      if (buttonRef.current && buttonRef.current.contains(target)) return;
      setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("keydown", onKey);
      document.addEventListener("pointerdown", onPointerDown);
      // lock body scroll
      document.documentElement.style.overflow = "hidden";
      // focus first link for keyboard users
      setTimeout(() => firstLinkRef.current?.focus(), 50);
    } else {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
      document.documentElement.style.overflow = "";
    }

    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
      document.documentElement.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Bouton hamburger */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-controls="mobile-sidebar"
        className={
          `lg:hidden ${inline ? "relative p-2 -ml-1" : "fixed top-4 left-4 p-3"} ${isOpen ? "z-[95]" : "z-[90]"} ${
            inline
              ? "bg-white/10 hover:bg-white/20 rounded-lg shadow-none focus-visible:ring-1 focus-visible:ring-white/40"
              : "bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          } transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500`
        }
        aria-label="Ouvrir le menu"
      >
        <Menu
          className={`${
            inline ? "w-6 h-6 text-white dark:text-gray-200" : "w-6 h-6 text-[#1a1a1a] dark:text-gray-200"
          }`}
        />
      </button>

      {isOpen && createPortal(
      <aside
        ref={asideRef}
        id="mobile-sidebar"
        role="dialog"
        aria-modal={isOpen}
        aria-label="Menu principal"
        className={`lg:hidden fixed inset-0 ${isOpen ? "z-[100]" : "z-40"} w-screen h-screen bg-white dark:bg-gray-900 p-6 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        } rounded-none flex flex-col overflow-y-auto`}
      >
        {/* Bouton fermer */}
        <button onClick={closeSidebar} className="absolute top-4 right-4 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" aria-label="Fermer le menu">
          <X className="w-6 h-6 text-[#1a1a1a] dark:text-gray-200" />
        </button>

        {/* Navigation */}
        <div className="mt-6 rounded-xl bg-white/60 dark:bg-white/5 p-2 shadow-sm dark:shadow-gray-900/30 flex-1 min-h-0">
          <nav className="flex flex-col gap-2 overflow-y-auto pr-1" role="menu" aria-orientation="vertical">
            {mainNavItems.map((item, idx) => (
              <NavItem
                key={item.to}
                icon={item.icon}
                label={item.label}
                to={item.to}
                isActive={currentPath === item.to}
                onClick={closeSidebar}
                ref={idx === 0 ? firstLinkRef : undefined}
              />
            ))}

            <div className="pt-1">
              <NavItem icon={<Settings className="w-5 h-5" />} label="Paramètres" to="/parametres" isActive={currentPath === "/parametres"} onClick={closeSidebar} />
            </div>
          </nav>
        </div>
      </aside>,
      document.body)}
    </>
  );
};

export default MobileSidebar;
