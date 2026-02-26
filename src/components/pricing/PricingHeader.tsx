import React from "react";

/**
 * PricingHeader — En-tête de la page pricing First Immo
 * Affiche le titre, sous-titre et les 3 piliers de valeur
 */
const PricingHeader: React.FC = () => {
  return (
    <section className="flex flex-col items-center px-6 pt-16 pb-14">
      {/* Titre principal */}
      <h2 className="text-[2rem] md:text-[2.5rem] font-bold text-slate-900 text-center leading-tight tracking-tight max-w-2xl">
        Choisissez le plan adapté à votre ambition
      </h2>
      <p className="mt-4 text-lg text-slate-500 text-center max-w-xl leading-relaxed">
        Plus vous êtes transparent, plus vous êtes visible. Plus vous êtes visible, plus vous recevez de leads qualifiés.
      </p>

      {/* Les 3 piliers */}
      <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        {/* Pilier 1 */}
        <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl mb-4" style={{ backgroundColor: "#E8F5EE" }}>
            <span className="text-2xl">🛡️</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">Confiance visible</h3>
          <p className="text-sm text-slate-500 text-center leading-relaxed">
            Score /100, badges, historique d'avancement, preuves documentaires.
          </p>
        </div>

        {/* Pilier 2 */}
        <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl mb-4" style={{ backgroundColor: "#FFF7ED" }}>
            <span className="text-2xl">🎯</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">Leads qualifiés</h3>
          <p className="text-sm text-slate-500 text-center leading-relaxed">
            Des acheteurs avec budget, délai, type de bien et intention réelle.
          </p>
        </div>

        {/* Pilier 3 */}
        <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl mb-4" style={{ backgroundColor: "#EFF6FF" }}>
            <span className="text-2xl">📊</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">Distribution méritocratique</h3>
          <p className="text-sm text-slate-500 text-center leading-relaxed">
            Le ranking est lié à la discipline, pas au budget pub.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingHeader;
