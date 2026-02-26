import React, { useEffect, useRef, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { LayoutGrid, Settings, Menu, X, CalendarDays, Star } from "lucide-react";
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
    { icon: <CalendarDays className="w-5 h-5" />, label: "Rendez-vous", to: "/rendez-vous" },
    { icon: <Star className="w-5 h-5" />, label: "Mes avis", to: "/avis" },
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
          `lg:hidden ${inline ? "p-0 ml-8 relative top-2" : "fixed top-4 left-4 p-3"} ${isOpen ? 'z-20' : 'z-[60]'} ${inline ? 'bg-transparent dark:bg-transparent shadow-none hover:bg-transparent focus-visible:ring-0 rounded-none' : 'bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700'} transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500`
        }
        aria-label="Ouvrir le menu"
      >
        <Menu className={`${inline ? 'w-6 h-6 text-white dark:text-gray-200' : 'w-6 h-6 text-[#1a1a1a] dark:text-gray-200'}`} />
      </button>

      {/* Overlay */}
      <div
        className={`lg:hidden fixed inset-0 ${isOpen ? 'z-[60]' : 'z-30'} bg-black/60 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={closeSidebar}
        aria-hidden={!isOpen}
      />

      {/* Sidebar mobile slide-in */}
      <aside
        ref={asideRef}
        id="mobile-sidebar"
        role="dialog"
        aria-modal={isOpen}
        aria-label="Menu principal"
        className={`lg:hidden fixed top-0 ${inline ? 'left-6' : 'left-0'} h-full ${isOpen ? 'z-[70]' : 'z-40'} bg-transparent ${inline ? 'w-[280px]' : 'w-[300px]'} p-6 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"} rounded-r-2xl flex flex-col`}
      >
        {/* Bouton fermer */}
        <button onClick={closeSidebar} className="absolute top-4 right-4 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" aria-label="Fermer le menu">
          <X className="w-6 h-6 text-[#1a1a1a] dark:text-gray-200" />
        </button>

        {/* Navigation (non-scrollable, compact) - show background only when open */}
        <div className={`mt-6 rounded-lg p-1 transition-colors duration-200 ${isOpen ? 'bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-900/30' : 'bg-transparent shadow-none'}`}>
          <nav className="flex flex-col gap-2 pt-1 pb-1" role="menu" aria-orientation="vertical">
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
      </aside>
    </>
  );
};

export default MobileSidebar;
