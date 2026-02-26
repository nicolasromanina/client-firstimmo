import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  Crown, Loader2, Rocket, CheckCircle2, XCircle, ArrowRight,
} from "lucide-react";
import PricingHeader from "@/components/pricing/PricingHeader";
import PricingCard from "@/components/pricing/PricingCard";
import { plansData } from "@/components/pricing/PlansData";
import type { PlanData } from "@/components/pricing/PricingCard";
import Footer from "@/components/Footer";
import { usePromoteurStatus } from "@/hooks/useApi";

/**
 * Correspondance nom UI → identifiant plan backend
 */
const planNameToId: Record<string, string> = {
  Starter: "starter",
  Publié: "publie",
  Vérifié: "verifie",
  Premium: "partenaire",
  Enterprise: "enterprise",
};

/* ---------- Success View ---------- */
const SuccessView = () => {
  const promoteurDashboardUrl =
    import.meta.env.VITE_PROMOTEUR_URL || "http://localhost:8081";

  return (
    <div className="max-w-2xl mx-auto text-center py-16 px-4">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-10 h-10 text-green-600" />
      </div>
      <h1 className="text-3xl font-bold text-slate-900 mb-4">Félicitations ! 🎉</h1>
      <p className="text-lg text-slate-600 mb-2">
        Votre paiement a été accepté avec succès.
      </p>
      <p className="text-slate-500 mb-8">
        Vous êtes maintenant{" "}
        <span className="font-semibold text-green-700">Promoteur</span> sur notre
        plateforme. Complétez votre profil pour commencer à publier vos projets.
      </p>

      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8 text-left">
        <h3 className="font-semibold text-slate-900 mb-3">Prochaines étapes :</h3>
        <ul className="space-y-3">
          {[
            "Complétez votre profil promoteur (logo, description, coordonnées)",
            "Soumettez vos documents KYC pour la vérification",
            "Publiez votre premier projet immobilier",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span className="text-slate-700 text-sm">{step}</span>
            </li>
          ))}
        </ul>
      </div>

      <a
        href={promoteurDashboardUrl}
        className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-xl transition-colors"
      >
        <Rocket className="w-5 h-5" />
        Accéder à mon espace promoteur
      </a>
    </div>
  );
};

/* ---------- Already Promoteur View ---------- */
const AlreadyPromoteurView = ({
  promoteur,
}: {
  promoteur?: { organizationName: string; plan: string } | null;
}) => {
  const promoteurDashboardUrl =
    import.meta.env.VITE_PROMOTEUR_URL || "http://localhost:8081";

  return (
    <div className="max-w-2xl mx-auto text-center py-16 px-4">
      <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Crown className="w-10 h-10 text-amber-600" />
      </div>
      <h1 className="text-3xl font-bold text-slate-900 mb-4">
        Vous êtes déjà Promoteur
      </h1>
      {promoteur?.organizationName && (
        <p className="text-lg font-semibold text-slate-600 mb-2">
          {promoteur.organizationName}
        </p>
      )}
      <p className="text-slate-500 mb-8">
        Votre compte promoteur est actif. Accédez à votre espace pour gérer vos
        projets.
      </p>
      <a
        href={promoteurDashboardUrl}
        className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-8 rounded-xl transition-colors"
      >
        <Rocket className="w-5 h-5" />
        Accéder à mon espace promoteur
      </a>
    </div>
  );
};

/* ---------- Main Page ---------- */
const BecomePromoteur = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { data: statusData, isLoading: isStatusLoading } = usePromoteurStatus();

  const sessionId = searchParams.get("session_id");
  const isCanceled = searchParams.get("canceled");

  const handlePlanClick = (plan: PlanData) => {
    const planId = planNameToId[plan.name];
    if (!planId) return;
    if (planId === "enterprise") {
      navigate("/contact");
      return;
    }
    navigate(`/devenir-promoteur/paiement?plan=${planId}`);
  };

  // Loading
  if (isStatusLoading) {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#F8FAFB" }}
      >
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </main>
    );
  }

  // Succès après paiement
  if (sessionId) {
    return (
      <main className="min-h-screen" style={{ backgroundColor: "#F8FAFB" }}>
        <SuccessView />
        <Footer />
      </main>
    );
  }

  // Déjà promoteur
  if (statusData?.isPromoteur) {
    return (
      <main className="min-h-screen" style={{ backgroundColor: "#F8FAFB" }}>
        <AlreadyPromoteurView promoteur={statusData.promoteur} />
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F8FAFB" }}>
      {/* Alerte annulation */}
      {isCanceled && (
        <div className="max-w-7xl mx-auto px-6 pt-6">
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
            <XCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-700">
              Le paiement a été annulé. Vous pouvez réessayer quand vous le
              souhaitez.
            </p>
          </div>
        </div>
      )}

      {/* En-tête — identique à /pricing */}
      <PricingHeader />

      {/* Grille des plans — identique à /pricing */}
      <section className="px-6 pb-16 max-w-[1320px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plansData.map((plan, index) => (
            <PricingCard
              key={plan.name}
              plan={plan}
              index={index}
              onSubscribe={
                plan.name !== "Enterprise"
                  ? () => handlePlanClick(plan)
                  : undefined
              }
              onContact={
                plan.name === "Enterprise"
                  ? () => handlePlanClick(plan)
                  : undefined
              }
            />
          ))}
        </div>
      </section>

      {/* CTA comparatif — identique à /pricing */}
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

      <footer className="border-t border-slate-200 px-8 py-6 flex items-center justify-between">
        <p className="text-xs text-slate-400">
          FIRST IMMO — Guide des plans v1.0 — 2026
        </p>
        <p className="text-xs text-slate-400">contact@firstimmo.com</p>
      </footer>
    </main>
  );
};

export default BecomePromoteur;
