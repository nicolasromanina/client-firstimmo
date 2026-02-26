import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Logo from "@/assets/Logo.png";
import HeaderBg from "@/assets/header-bg.png";
import Navigation from "./header/Navigation";
import UserDropdown from "./header/UserDropDown";
import NotificationBell from "./NotificationBell";
import MobileSidebar from "./MobileSidebar";

interface HeaderProps {
  title?: string;
  showMobileSidebar?: boolean;
}

const Header = ({ title, showMobileSidebar = true }: HeaderProps) => {
  const [elevated, setElevated] = useState(false);

  useEffect(() => {
    const onScroll = () => setElevated((window.scrollY || 0) > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const header = document.getElementById("dashboard-header");
    if (header) {
      document.body.style.paddingTop = header.offsetHeight + 16 + "px";
    }
    return () => {
      document.body.style.paddingTop = "";
    };
  }, []);

  return (
    <header
      id="dashboard-header"
      className={`fixed top-0 left-0 right-0 z-40 px-3 pt-3 sm:px-4 sm:pt-4 transition-shadow duration-300 ${
        elevated ? "shadow-2xl" : ""
      }`}
    >
      {/* White mask behind gap */}
      <div className="absolute inset-x-0 top-0 h-4 bg-white" />

      {/* Main container */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl">
        {/* Background image */}
        <img
          src={HeaderBg}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-[hsl(220,20%,10%)]/80" />

        {/* Diagonal lines pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 10px, white 10px, white 11px)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          {/* Top bar: 3-zone grid */}
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
            {/* Left: hamburger (mobile) + logo */}
            <div className="flex items-center gap-3">
              {showMobileSidebar && <MobileSidebar />}
              <Link to="/" className="flex-shrink-0">
                <img
                  src={Logo}
                  alt="FIRST IMMO"
                  className="h-8 sm:h-10 w-auto"
                />
              </Link>
            </div>

            {/* Center: desktop nav */}
            <div className="flex justify-center">
              <Navigation />
            </div>

            {/* Right: notification + user */}
            <div className="flex items-center gap-2">
              <NotificationBell />
              <UserDropdown />
            </div>
          </div>

          {/* Mobile quick nav pills — scrollable horizontal */}
          <div className="md:hidden mt-3 -mx-4 px-4">
            <div
              className="flex gap-2 overflow-x-auto pb-1"
              style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
            >
              <style>{`.mobile-pills::-webkit-scrollbar { display: none; }`}</style>
              <div className="mobile-pills flex gap-2">
                {[
                  { label: "Accueil", url: `${import.meta.env.VITE_FIRSTIMMO_URL || 'http://localhost:8084'}/` },
                  { label: "Annuaires", url: `${import.meta.env.VITE_FIRSTIMMO_URL || 'http://localhost:8084'}/Pannuaire` },
                  { label: "Nos projets", url: `${import.meta.env.VITE_FIRSTIMMO_URL || 'http://localhost:8084'}/liste-proj` },
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.url}
                    className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium text-white/80 bg-white/10 hover:bg-white/20 transition-colors min-h-[36px] flex items-center"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Title / hero text */}
          <div className="mt-4 sm:mt-6 mb-2 text-center">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
              {title ?? "Bonjour et Bienvenue"}
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
