/**
 * Footer Component - FIRST IMMO
 * 
 * Structure:
 * - Logo centré en haut
 * - 3 colonnes: Description | Liens Utiles | Pages Légales
 * - Séparateur horizontal + Copyright
 * - Fond avec pattern de lignes ondulées
 * - Entièrement responsive
 */

import FirstImmoLogo from "@/assets/Logo.png";
import footerPattern from "@/assets/footer-bg.png";

/**
 * Données des liens utiles
 */
const liensUtiles = [
  { label: "Nos projets", href: "#" },
  { label: "Annuaires", href: "#" },
];

/**
 * Données des pages légales
 */
const pagesLegales = [
  { label: "Politique de confidentialité", href: "#" },
  { label: "Conditions général d'utilisation", href: "#" },
  { label: "Mentions Légales", href: "#" },
];

const Footer = () => {
  return (
    <footer className="relative mx-3 my-3 sm:mx-4 sm:my-4 md:mx-8 md:my-8 lg:mx-10 lg:my-10 rounded-3xl bg-black">
      {/* Pattern de fond avec lignes ondulées */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${footerPattern})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Contenu du footer */}
      <div className="relative z-10">
        {/* Logo centré */}
        <div className="flex justify-center pt-10 pb-8 md:pt-14 md:pb-12">
          <img src={FirstImmoLogo} alt="First Immo Logo" className="h-10 md:h-12 w-auto" />
        </div>

        {/* Grille principale avec 3 colonnes */}
        <div className="mx-10 pb-16 md:mx-12 lg:mx-20 xl:mx-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 lg:gap-20">
            {/* Colonne 1: Description */}
            <div className="text-center md:text-left">
              <p className="text-white text-base leading-relaxed max-w-xs mx-auto md:mx-0">
                Nunc vulputate libero et velit interdum, ac aliquet odio mattis.
              </p>
            </div>

            {/* Colonne 2: Liens Utiles */}
            <div className="text-center md:text-left">
              <h3 className="text-white font-bold text-lg tracking-wide uppercase mb-4">
                LIENS UTILES
              </h3>
              <nav className="flex flex-col gap-3">
                {liensUtiles.map((lien) => (
                  <a
                    key={lien.label}
                    href={lien.href}
                    className="text-white text-base hover:text-coral-500 transition-colors duration-200"
                  >
                    {lien.label}
                  </a>
                ))}
              </nav>
            </div>

            {/* Colonne 3: Pages Légales */}
            <div className="text-center md:text-left">
              <h3 className="text-white font-bold text-lg tracking-wide uppercase mb-4">
                PAGES LÉGALES
              </h3>
              <nav className="flex flex-col gap-3">
                {pagesLegales.map((lien) => (
                  <a
                    key={lien.label}
                    href={lien.href}
                    className="text-white text-base hover:text-coral-500 transition-colors duration-200"
                  >
                    {lien.label}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Séparateur horizontal */}
        <div className="mx-10 md:mx-12 lg:mx-20 xl:mx-32">
          <div className="h-px w-full bg-gray-700" />
        </div>

        {/* Copyright */}
        <div className="py-6 md:py-8">
          <p className="text-center text-gray-400 text-sm md:text-base">
            Copyright - Tous droits réservés
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;