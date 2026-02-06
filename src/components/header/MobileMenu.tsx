import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, X, ChevronRight } from "lucide-react";

/**
 * Menu mobile hamburger
 * - Bouton burger pour mobile/tablette
 * - Menu plein écran avec navigation
 */
const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null);

  const navItems = [
    { label: "Accueil", path: "#" },
    { label: "Annuaires", path: "#" },
    { label: "Nos projets", path: "#" },
  ];

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("keydown", onKey);
      document.documentElement.style.overflow = "hidden";
      setTimeout(() => firstLinkRef.current?.focus(), 50);
    } else {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    }

    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <div className="md:hidden">
      {/* Bouton hamburger (masqué quand le menu est ouvert pour éviter le double X) */}
      {!isOpen && (
        <button
          onClick={toggleMenu}
          className="p-2 text-white rounded-lg hover:bg-white/10 transition-colors relative z-[60]"
          aria-label="Ouvrir le menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      {/* Overlay menu mobile */}
      {isOpen &&
        (typeof document !== "undefined"
          ? createPortal(
              <div
                  className="fixed inset-0 z-[70] bg-black/30"
                  role="dialog"
                  aria-modal="true"
                  onClick={closeMenu}
                >
                  <div className="relative z-10 min-h-full">
                    {/* Header du menu mobile */}
                    <div className="flex items-center justify-end p-4">
                      <button
                        onClick={closeMenu}
                        className="p-2 text-white rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        aria-label="Fermer le menu"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    {/* Navigation mobile centrée (sans flou) */}
                    <nav className="w-full flex flex-col items-center justify-start gap-4 px-6 py-6">
                      {navItems.map((item, index) => (
                        <MobileMenuItem
                          key={index}
                          item={item}
                          isFirst={index === 0}
                          firstLinkRef={firstLinkRef}
                        />
                      ))}
                    </nav>
                  </div>
                </div>,
              document.body
            )
          : null)}
    </div>
  );
};

export default MobileMenu;

// ---------- Helper component for mobile menu items ----------
type NavItemType = {
  label: string;
  path: string;
  children?: { label: string; path: string }[];
};

function MobileMenuItem({
  item,
  isFirst,
  firstLinkRef,
}: {
  item: NavItemType;
  isFirst?: boolean;
  firstLinkRef?: React.RefObject<HTMLAnchorElement | null>;
}) {
  const [open, setOpen] = useState(false);

  if (!item.children || item.children.length === 0) {
    return (
      <a
        href={item.path}
        ref={isFirst ? firstLinkRef : undefined}
        className="w-full max-w-xs flex items-center justify-center px-6 py-4 rounded-xl text-lg font-semibold text-black bg-white hover:bg-gray-100 transition-colors touch-manipulation shadow-sm"
      >
        <span>{item.label}</span>
      </a>
    );
  }

  return (
    <div className="w-full max-w-xs">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 px-6 py-4 rounded-xl text-lg font-semibold text-black bg-white hover:bg-gray-100 transition-colors touch-manipulation shadow-sm"
      >
        <span className="flex items-center gap-3">
          <ChevronRight className="w-4 h-4 text-black rotate-0" />
          {item.label}
        </span>
        <span className={`transform transition-transform ${open ? "rotate-90" : "rotate-0"}`}>
          <ChevronRight className="w-5 h-5 text-black" />
        </span>
      </button>

      <div className={`mt-3 overflow-hidden transition-all ${open ? "max-h-40" : "max-h-0"}`}>
        <div className="flex flex-col gap-2">
          {item.children.map((c) => (
            <a key={c.path} href={c.path} className="block px-4 py-3 rounded-lg bg-white text-black text-sm hover:bg-gray-50">
              {c.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
