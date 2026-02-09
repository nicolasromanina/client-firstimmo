import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "@/assets/Logo.png";
import HeaderBg from "@/assets/header-bg.png";
import Navigation from "./header/Navigation";
import UserDropdown from "./header/UserDropDown";
import MobileSidebar from "./MobileSidebar";


/**
 * Header principal FIRST IMMO
 * - Container arrondi fond noir avec lignes diagonales subtiles
 * - Logo à gauche, Navigation centrée, Bouton utilisateur à droite
 * - Texte "Bonjour et Bienvenue" centré en dessous
 * - Entièrement responsive
 */
interface HeaderProps {
  title?: string;
  showMobileSidebar?: boolean;
}

const Header = ({ title, showMobileSidebar = true }: HeaderProps) => {
  const [hidden, setHidden] = useState(false);
  const [elevated, setElevated] = useState(false);
  const lastScroll = useRef(0);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY || 0;
      setElevated(current > 8);

      // hide on scroll down (after a small threshold), show on scroll up
      if (current > lastScroll.current && current > 120) {
        setHidden(true);
      } else {
        setHidden(false);
      }

      lastScroll.current = current;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header aria-label="En-tête principal" className={`sticky top-4 sm:top-10 left-0 w-full z-50 mb-6 sm:mb-10 transform transition-transform duration-300 ${hidden ? "-translate-y-full" : "translate-y-0"}`}>
      {/* Container principal avec fond noir et lignes diagonales */}
      <div className={`relative overflow-visible rounded-2xl sm:rounded-3xl bg-transparent border border-gray-800/30 mx-4 sm:mx-6 lg:mx-8 transition-shadow duration-200 ${elevated ? 'shadow-md backdrop-blur-sm bg-black/30' : ''}`}>
        {/* Image de background full-cover */}
           <div
             className="absolute inset-0 bg-cover bg-center bg-no-repeat"
             style={{
               backgroundImage: `url('${HeaderBg}')`,
             }}
             aria-hidden="true"
           />

        {/* Overlay sombre pour lisibilité */}
           <div className="absolute inset-0 bg-black/10" aria-hidden="true" />

        {/* Motif de lignes diagonales subtiles au-dessus de l'overlay */}
        <div 
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(255, 255, 255, 0.08) 10px,
              rgba(255, 255, 255, 0.08) 11px
            )`
          }}
        />

        {/* Contenu du header */}
        <div className="relative z-10 px-3 py-3 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
          {/* Top bar: use a 3-col grid for consistent mobile alignment */}
          <div className="grid grid-cols-3 items-center gap-3">
            {/* Left: hamburger (mobile) + logo (desktop) */}
            <div className="flex items-center gap-3">
              {showMobileSidebar ? (
                <div className="lg:hidden">
                  <MobileSidebar inline />
                </div>
              ) : null}
              <div className="hidden lg:block">
                <img src={Logo} alt="Logo" className="h-10 w-auto object-contain max-w-[160px]" />
              </div>
            </div>

            {/* Center: mobile logo + desktop navigation */}
            <div className="flex items-center justify-center">
              <div className="lg:hidden">
                <img
                  src={Logo}
                  alt="Logo"
                  className="h-9 w-auto object-contain max-w-[140px]"
                />
              </div>
              <div className="hidden lg:flex items-center justify-center">
                <Navigation />
              </div>
            </div>

            {/* Right: user dropdown */}
            <div className="flex items-center justify-end">
              <UserDropdown />
            </div>
          </div>

          {/* Mobile quick nav: horizontal, scrollable small pills */}
          <div className="mt-3 lg:hidden">
            <div className="flex items-center justify-center gap-3 overflow-x-auto px-2 py-1">
              <Link to="/" className="flex-shrink-0 px-3 py-2 rounded-full bg-white/10 text-white text-sm font-medium hover:bg-white/20">Accueil</Link>
              <Link to="/annuaires" className="flex-shrink-0 px-3 py-2 rounded-full bg-white/10 text-white text-sm font-medium hover:bg-white/20">Annuaires</Link>
              <Link to="/projects" className="flex-shrink-0 px-3 py-2 rounded-full bg-white/10 text-white text-sm font-medium hover:bg-white/20">Nos projets</Link>
            </div>
          </div>

          {/* Title / hero text */}
          <div className="mt-4 sm:mt-6 lg:mt-8 text-center pb-3 sm:pb-6 lg:pb-8">
            <h1 className="text-lg md:text-3xl lg:text-4xl xl:text-5xl font-light text-white leading-tight truncate">
              {(() => {
                if (title) return title;
                const path = (location?.pathname || "/").toLowerCase();

                if (path === "/" || path === "/dashboard") return "Bonjour et Bienvenue";
                if (path.startsWith("/profil/edit")) return "Mon profil";
                if (path.startsWith("/profil")) return "Mon Profil";
                if (path.startsWith("/projets")) return "Mes Projets";
                if (path.startsWith("/documents")) return "Mes documents";
                if (path.startsWith("/partenaires")) return "Partenaires";
                if (path.startsWith("/parametres")) return "Paramètres";

                return "Bonjour et Bienvenue";
              })()}
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
