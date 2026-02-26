import React from "react";
import { Check, X, Minus } from "lucide-react";

/**
 * Type pour une ligne de comparaison
 */
interface ComparisonRow {
  feature: string;
  starter: string;
  publie: string;
  verifie: string;
  premium: string;
  enterprise: string;
}

/**
 * Catégorie de fonctionnalités pour le tableau comparatif
 */
interface ComparisonCategory {
  title: string;
  icon: string;
  rows: ComparisonRow[];
}

/**
 * Données du tableau comparatif complet
 */
const comparisonData: ComparisonCategory[] = [
  {
    title: "Projets & Pages",
    icon: "📁",
    rows: [
      { feature: "Projets actifs simultanés", starter: "1", publie: "1", verifie: "2", premium: "3", enterprise: "Illimité" },
      { feature: "Page projet complète", starter: "Standard", publie: "✓", verifie: "✓ Optimisée", premium: "✓ Managée", enterprise: "✓" },
      { feature: "Médias (photos, rendus)", starter: "5 max", publie: "15 max", verifie: "Illimité", premium: "Illimité", enterprise: "Illimité" },
      { feature: "Vidéos projet", starter: "✗", publie: "1 vidéo", verifie: "Illimité", premium: "Illimité", enterprise: "Illimité" },
      { feature: "Journal des changements", starter: "✗", publie: "✓", verifie: "✓ Complet", premium: "✓ Managé", enterprise: "✓" },
    ],
  },
  {
    title: "Conformité & Vérification",
    icon: "🔒",
    rows: [
      { feature: "KYC / Documents société", starter: "Light", publie: "Complet", verifie: "Complet + Audit", premium: "✓ Managé", enterprise: "✓ Managé" },
      { feature: "Badge Vérifié Plateforme", starter: "✗", publie: "✗", verifie: "✓", premium: "✓", enterprise: "✓" },
      { feature: "Score Transparence /100 public", starter: "✗", publie: "✗", verifie: "✓", premium: "✓ + Coaching", enterprise: "✓" },
      { feature: "Checklist conformité", starter: "Basique", publie: "✓", verifie: "✓", premium: "✓ Managé", enterprise: "✓" },
      { feature: "Preuve capacité financière", starter: "✗", publie: "✗", verifie: "✓", premium: "✓", enterprise: "✓" },
    ],
  },
  {
    title: "Updates & Transparence",
    icon: "📢",
    rows: [
      { feature: "Updates format imposé", starter: "✗", publie: "✓", verifie: "✓ Illimité", premium: "✓ Managé (8/mois)", enterprise: "Illimité" },
      { feature: "Rappels automatiques", starter: "✗", publie: "✗", verifie: "✓", premium: "✓", enterprise: "✓" },
      { feature: "Déclaration retard justifié", starter: "✗", publie: "✓", verifie: "✓", premium: "✓ Managé", enterprise: "✓" },
      { feature: "Déclaration risques + mitigation", starter: "✗", publie: "✗", verifie: "✓", premium: "✓ Managé", enterprise: "✓" },
      { feature: "Timeline jalons complète", starter: "✗", publie: "✓", verifie: "✓", premium: "✓ Managé", enterprise: "✓" },
    ],
  },
  {
    title: "Doc Vault",
    icon: "📄",
    rows: [
      { feature: "Upload documents", starter: "3 docs", publie: "20 docs", verifie: "Illimité", premium: "Illimité", enterprise: "Illimité" },
      { feature: "Catégorisation par types", starter: "✗", publie: "✓", verifie: "✓", premium: "✓ Managé", enterprise: "✓" },
      { feature: "Versioning documents", starter: "✗", publie: "Basique", verifie: "✓ Complet", premium: "✓ Complet", enterprise: "✓" },
      { feature: "Data-room privée partageable", starter: "✗", publie: "✗", verifie: "✓", premium: "✓", enterprise: "✓ Multiple" },
      { feature: "Statut fourni/manquant/expiré", starter: "✗", publie: "✓", verifie: "✓ + Alertes", premium: "✓ + Alertes", enterprise: "✓" },
    ],
  },
  {
    title: "Leads & Conversion",
    icon: "🎯",
    rows: [
      { feature: "Formulaire lead", starter: "Basique", publie: "Standard", verifie: "Qualifiant", premium: "Optimisé (CRO)", enterprise: "Consolidé" },
      { feature: "Réception leads", starter: "Email", publie: "Email + WA", verifie: "Tous canaux", premium: "Tous canaux", enterprise: "Dashboard" },
      { feature: "Scoring leads A/B/C", starter: "✗", publie: "✗", verifie: "✓", premium: "✓", enterprise: "✓" },
      { feature: "Pipeline lead complet", starter: "✗", publie: "✗", verifie: "✓", premium: "✓", enterprise: "✓" },
      { feature: "Relance automatique leads", starter: "✗", publie: "✗", verifie: "✓", premium: "✓ + SLA", enterprise: "✓ SLA" },
      { feature: "Export leads CSV", starter: "✗", publie: "✗", verifie: "✓", premium: "✓", enterprise: "✓ Custom" },
      { feature: "Templates WhatsApp diaspora", starter: "✗", publie: "✗", verifie: "✓", premium: "✓ Perso.", enterprise: "✓" },
      { feature: "Prise de RDV calendrier", starter: "✗", publie: "✗", verifie: "✓", premium: "✓", enterprise: "✓" },
    ],
  },
  {
    title: "Score & Réputation",
    icon: "🏆",
    rows: [
      { feature: "Badges de confiance", starter: "✗", publie: "✗", verifie: "✓", premium: "✓ Managé", enterprise: "✓ Groupe" },
      { feature: "Trafic prioritaire / ranking", starter: "✗", publie: "✗", verifie: "✓", premium: "Prioritaire", enterprise: "✓" },
      { feature: "Homepage / Top Verified", starter: "✗", publie: "✗", verifie: "Selon discipline", premium: "Prioritaire", enterprise: "✓" },
      { feature: "Appeal process", starter: "✗", publie: "✗", verifie: "✓", premium: "✓ Prioritaire", enterprise: "✓ Dédié" },
    ],
  },
  {
    title: "Reporting & Support",
    icon: "📊",
    rows: [
      { feature: "Reporting mensuel", starter: "✗", publie: "✗", verifie: "✓", premium: "Avancé", enterprise: "Exécutif" },
      { feature: "Point pilotage visio", starter: "✗", publie: "✗", verifie: "✗", premium: "✓ Mensuel", enterprise: "✓ Régulier" },
      { feature: "Support", starter: "Email 72h", publie: "Email 48h", verifie: "Prioritaire 24h", premium: "Dédié 12h", enterprise: "SLA contractuel" },
    ],
  },
  {
    title: "Équipe & Accès",
    icon: "👥",
    rows: [
      { feature: "Utilisateurs promoteur", starter: "1", publie: "2", verifie: "3", premium: "3", enterprise: "Illimité" },
      { feature: "Assignation membres", starter: "✗", publie: "Basique", verifie: "✓ Par projet", premium: "✓", enterprise: "✓ Avancé" },
      { feature: "Multi-projets", starter: "✗", publie: "✗", verifie: "Option", premium: "✓ 3 inclus", enterprise: "✓ Illimité" },
      { feature: "API / Webhooks / CRM", starter: "✗", publie: "✗", verifie: "✗", premium: "Option", enterprise: "✓" },
    ],
  },
];

/**
 * Rendu d'une cellule du tableau
 * Affiche ✓, ✗ ou le texte avec style adapté
 */
const CellContent: React.FC<{ value: string }> = ({ value }) => {
  if (value === "✗") {
    return (
      <div className="flex justify-center">
        <X size={16} className="text-slate-300" strokeWidth={2.5} />
      </div>
    );
  }
  if (value === "✓") {
    return (
      <div className="flex justify-center">
        <Check size={16} strokeWidth={2.5} style={{ color: "#1A6B3C" }} />
      </div>
    );
  }
  // Texte avec éventuel checkmark
  const hasCheck = value.startsWith("✓");
  return (
    <span className={`text-xs font-medium text-center leading-snug ${hasCheck ? "text-slate-700" : "text-slate-500"}`}>
      {value}
    </span>
  );
};

/**
 * En-têtes de colonnes avec couleurs des plans
 */
const planHeaders = [
  { name: "Starter", color: "#64748B", bg: "#F1F5F9" },
  { name: "Publié", color: "#D97706", bg: "#FFF7ED" },
  { name: "Vérifié", color: "#1A6B3C", bg: "#E8F5EE" },
  { name: "Premium", color: "#7C3AED", bg: "#F3EEFF" },
  { name: "Enterprise", color: "#1E293B", bg: "#F1F5F9" },
];

/**
 * ComparisonTable — Tableau comparatif complet de toutes les fonctionnalités
 * Organisé par catégories avec icônes et codes couleur par plan
 */
const ComparisonTable: React.FC = () => {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[900px] border-collapse">
        {/* En-tête sticky */}
        <thead>
          <tr>
            <th className="sticky top-0 z-10 bg-white text-left pl-6 pr-4 py-5 text-sm font-semibold text-slate-400 w-[260px] border-b border-slate-200">
              Fonctionnalité
            </th>
            {planHeaders.map((plan) => (
              <th key={plan.name} className="sticky top-0 z-10 bg-white px-3 py-5 text-center border-b border-slate-200">
                <div
                  className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider"
                  style={{ backgroundColor: plan.bg, color: plan.color }}
                >
                  {plan.name}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {comparisonData.map((category, catIndex) => (
            <React.Fragment key={catIndex}>
              {/* Titre de catégorie */}
              <tr>
                <td
                  colSpan={6}
                  className="pl-6 pr-4 pt-8 pb-3 text-sm font-bold text-slate-800 tracking-wide"
                  style={{ backgroundColor: "#FAFBFC" }}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.title}
                </td>
              </tr>

              {/* Lignes de features */}
              {category.rows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors duration-150"
                >
                  <td className="pl-6 pr-4 py-3.5 text-sm text-slate-600 font-medium">
                    {row.feature}
                  </td>
                  <td className="px-3 py-3.5 text-center"><CellContent value={row.starter} /></td>
                  <td className="px-3 py-3.5 text-center"><CellContent value={row.publie} /></td>
                  <td className="px-3 py-3.5 text-center" style={{ backgroundColor: "rgba(26, 107, 60, 0.03)" }}>
                    <CellContent value={row.verifie} />
                  </td>
                  <td className="px-3 py-3.5 text-center"><CellContent value={row.premium} /></td>
                  <td className="px-3 py-3.5 text-center"><CellContent value={row.enterprise} /></td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ComparisonTable;
