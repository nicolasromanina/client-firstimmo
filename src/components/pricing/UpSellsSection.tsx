import React from "react";
import { Plus } from "lucide-react";

/**
 * Option upsell à la carte
 */
interface UpsellOption {
  name: string;
  price: string;
  description: string;
}

/**
 * Retainer mensuel récurrent
 */
interface RetainerOption {
  name: string;
  price: string;
  scope: string;
}

/** Données des options à la carte */
const upsellOptions: UpsellOption[] = [
  { name: "Projet supplémentaire (Publié)", price: "À définir € / an", description: "1 projet additionnel sans priorité" },
  { name: "Projet supplémentaire (Vérifié)", price: "À définir € / an", description: "+800€ onboarding par projet sup" },
  { name: "Data Room Premium", price: "À définir € / an", description: "Partage sécurisé docs acheteurs diaspora" },
  { name: "Spotlight Newsletter", price: "À définir € / one-shot", description: "Mise en avant email à toute la base acheteurs" },
  { name: "Homepage Rotation 30 jours", price: "À définir € / mois", description: "Visibilité max, rotation homepage" },
  { name: "WhatsApp Pack", price: "À définir € / mois", description: "Templates relances + gestion objections diaspora" },
  { name: "Pack Lancement Projet", price: "À définir € / one-shot", description: "Rédaction page projet + optimisation CTA" },
  { name: "Formation Équipe", price: "À définir € / one-shot", description: "Onboarding équipe commerciale (visio 2h)" },
];

/** Données des retainers */
const retainerOptions: RetainerOption[] = [
  { name: "Cadence Manager", price: "300€ / mois", scope: "Relances avant deadline, vérif qualité updates" },
  { name: "Lead Nurturing", price: "250€ / mois", scope: "Relances leads B/C, templates WhatsApp, SLA 48h" },
  { name: "Ads Management", price: "500€ / mois + budget", scope: "Gestion campagnes Meta/Google (budget séparé)" },
  { name: "Account Manager Dédié", price: "400€ / mois", scope: "Interlocuteur unique, pilotage + recommandations" },
  { name: "Pack Reporting Exécutif", price: "200€ / mois", scope: "Rapport PDF mensuel complet envoyé à la direction" },
];

/**
 * UpsellsSection — Section des options à la carte et retainers
 * Affichée en bas de la page Upgrade
 */
const UpsellsSection: React.FC = () => {
  return (
    <section className="px-6 py-16 max-w-6xl mx-auto">
      {/* Options à la carte */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">
          Options à la carte
        </h2>
        <p className="text-sm text-slate-500 mb-8">
          Ajoutables à n'importe quel plan. Facturées séparément.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {upsellOptions.map((option, index) => (
            <div
              key={index}
              className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 hover:border-slate-300 hover:shadow-sm transition-all duration-200"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#E8F5EE" }}>
                  <Plus size={14} style={{ color: "#1A6B3C" }} strokeWidth={3} />
                </div>
                <h3 className="text-sm font-bold text-slate-800 leading-snug">{option.name}</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed flex-1">{option.description}</p>
              <p className="mt-3 text-xs font-bold text-slate-400 uppercase tracking-wider">{option.price}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Retainers mensuels */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">
          Retainers mensuels
        </h2>
        <p className="text-sm text-slate-500 mb-8">
          Services mensuels récurrents pour externaliser les opérations.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {retainerOptions.map((retainer, index) => (
            <div
              key={index}
              className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 hover:border-slate-300 hover:shadow-sm transition-all duration-200"
            >
              <h3 className="text-base font-bold text-slate-800 mb-1">{retainer.name}</h3>
              <p className="text-lg font-extrabold mb-3" style={{ color: "#1A6B3C" }}>{retainer.price}</p>
              <p className="text-sm text-slate-500 leading-relaxed">{retainer.scope}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UpsellsSection;
