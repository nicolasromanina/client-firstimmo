import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import PricingHeader from "@/components/pricing/PricingHeader";
import PricingCard from "@/components/pricing/PricingCard";
import { plansData } from "@/components/pricing/PlansData";

/**
 * Pricing — Page principale de tarification First Immo
 * Affiche l'en-tête, les 5 cartes de plans et un lien vers le comparatif détaillé
 */
const Pricing: React.FC = () => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8FAFB" }}>

      {/* En-tête avec piliers */}
      <PricingHeader />

      {/* Grille des plans */}
      <section className="px-6 pb-16 max-w-[1320px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plansData.map((plan, index) => (
            <PricingCard key={plan.name} plan={plan} index={index} />
          ))}
        </div>
      </section>

      {/* CTA comparatif détaillé */}
      <section className="flex flex-col items-center pb-20">
        <p className="text-sm text-slate-400 mb-3">Besoin de plus de détails ?</p>
        <Link
          to="/upgrade"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:opacity-90 shadow-md"
          style={{ backgroundColor: "#1A6B3C" }}
        >
          Voir le comparatif complet
          <ArrowRight size={16} />
        </Link>
      </section>

      {/* Footer minimal */}
      <footer className="border-t border-slate-200 px-8 py-6 flex items-center justify-between">
        <p className="text-xs text-slate-400">
          FIRST IMMO — Guide des plans v1.0 — 2026
        </p>
        <p className="text-xs text-slate-400">
          contact@firstimmo.com
        </p>
      </footer>
    </div>
  );
};

export default Pricing;
