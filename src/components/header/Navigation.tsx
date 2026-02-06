/**
 * Navigation centrale
 * - Container pilule avec bordure grise
 * - Liens : Accueil, Annuaires, Nos projets (liens #)
 * - États hover
 */
const Navigation = () => {
  const navItems = [
    { label: "Accueil", path: "#" },
    { label: "Annuaires", path: "#" },
    { label: "Nos projets", path: "#" },
  ];

  return (
    <nav className="hidden md:flex items-center">
      {/* Container pilule avec bordure */}
      <div className="flex items-center gap-1 px-2 py-1.5 rounded-full border border-gray-600/50 bg-gray-900/30">
        {navItems.map((item, index) => (
          <a
            key={index}
            href={item.path}
            className="px-5 py-2 text-sm font-medium text-gray-300 rounded-full transition-all duration-200 hover:text-white hover:bg-white/10"
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
