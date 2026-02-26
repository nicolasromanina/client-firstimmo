import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ComparisonTable from "@/components/pricing/ComparisonTable";
import UpsellsSection from "@/components/pricing/UpSellsSection";

/**
 * Upgrade — Page comparatif détaillé de toutes les fonctionnalités
 * Inclut le tableau comparatif complet + options à la carte + retainers
 */
const Upgrade: React.FC = () => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8FAFB" }}>
  

      {/* En-tête */}
      <section className="flex flex-col items-center px-6 pt-16 pb-10">
        <Link
          to="/pricing"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Retour aux plans
        </Link>

        <h1 className="text-[2rem] md:text-[2.5rem] font-bold text-slate-900 text-center leading-tight tracking-tight max-w-2xl">
          Comparatif complet des fonctionnalités
        </h1>
        <p className="mt-4 text-base text-slate-500 text-center max-w-xl leading-relaxed">
          Retrouvez en détail toutes les fonctionnalités disponibles pour chaque plan First Immo.
        </p>

        {/* Ligne décorative */}
        <div className="mt-8 w-24 h-1 rounded-full" style={{ background: "linear-gradient(90deg, #1A6B3C, #2BA05E)" }} />
      </section>

      {/* Tableau comparatif */}
      <section className="px-6 pb-12 max-w-[1200px] mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <ComparisonTable />
        </div>
      </section>

      {/* Section prix par plan (résumé rapide) */}
      <section className="px-6 pb-8 max-w-[1200px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { name: "Starter", price: "600€/an", color: "#64748B", bg: "#F1F5F9" },
            { name: "Publié", price: "1 500€/an", color: "#D97706", bg: "#FFF7ED" },
            { name: "Vérifié", price: "4 200€/an", color: "#1A6B3C", bg: "#E8F5EE" },
            { name: "Premium", price: "7 200€/an", color: "#7C3AED", bg: "#F3EEFF" },
            { name: "Enterprise", price: "Sur devis", color: "#1E293B", bg: "#F1F5F9" },
          ].map((plan) => (
            <div
              key={plan.name}
              className="flex flex-col items-center rounded-xl p-5 border border-slate-200"
              style={{ backgroundColor: plan.bg }}
            >
              <span className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: plan.color }}>
                {plan.name}
              </span>
              <span className="text-lg font-extrabold text-slate-900">{plan.price}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Options à la carte et Retainers */}
      <UpsellsSection />

      {/* Section Hybride */}
      <section className="px-6 pb-16 max-w-4xl mx-auto">
        <div
          className="rounded-2xl p-8 md:p-10 border"
          style={{ backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xl font-bold text-slate-900">Option Hybride — Success Fee</h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed mb-5">
            Pour les promoteurs qui hésitent sur le plan Vérifié. Payez moins à l'entrée, First Immo est aligné sur votre succès.
          </p>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 bg-white rounded-xl p-5 border border-slate-200">
              <h3 className="text-base font-bold text-slate-900 mb-1">Vérifié Hybride</h3>
              <p className="text-2xl font-extrabold mb-2" style={{ color: "#1A6B3C" }}>
                1 800€<span className="text-base font-medium text-slate-400"> / an</span>
              </p>
              <p className="text-sm text-slate-500">+ 150€ par lead qualifié A livré</p>
              <p className="text-xs text-slate-400 mt-2">Plafonné à 3 000€/an de variable</p>
            </div>
            <div className="flex-1 bg-white rounded-xl p-5 border border-slate-200">
              <h3 className="text-sm font-bold text-slate-700 mb-3">Simulation</h3>
              <div className="space-y-2">
                {[
                  { leads: "3/mois", cost: "7 200€", note: "Plus cher si bons résultats" },
                  { leads: "5/mois", cost: "4 800€ (plafond)", note: "Avantageux" },
                  { leads: "0 lead A", cost: "1 800€", note: "Risque minimal" },
                ].map((sim, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">{sim.leads}</span>
                    <span className="font-bold text-slate-900">{sim.cost}</span>
                    <span className="text-slate-400">{sim.note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Upgrade;
