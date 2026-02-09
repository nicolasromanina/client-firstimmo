import { useSearchParams, useNavigate } from "react-router-dom";
import { Crown, Loader2, Rocket, CheckCircle2, XCircle } from "lucide-react";
import PricingSection from "@/components/pricing/PricingSection";
import Footer from "@/components/Footer";
import { usePromoteurStatus } from "@/hooks/useApi";

/**
 * Page Devenir Promoteur — Choix du plan (Pricing)
 * Exactement la même structure que la page Pricing du dashboard promoteur.
 * Pas de sidebar — page plein écran.
 */

/* ---------- Success View ---------- */
const SuccessView = () => {
  const navigate = useNavigate();
  const promoteurDashboardUrl =
    import.meta.env.VITE_PROMOTEUR_URL || "http://localhost:8081";

  return (
    <div className="max-w-2xl mx-auto text-center py-12 px-4">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-10 h-10 text-green-600" />
      </div>
      <h1 className="text-3xl font-bold text-slate-900 mb-4">
        Félicitations ! 🎉
      </h1>
      <p className="text-lg text-slate-600 mb-2">
        Votre paiement a été accepté avec succès.
      </p>
      <p className="text-slate-500 mb-8">
        Vous êtes maintenant{" "}
        <span className="font-semibold text-coral-600">Promoteur</span> sur
        notre plateforme. Votre espace promoteur est prêt. Complétez votre
        profil pour commencer à publier vos projets.
      </p>

      <div className="bg-coral-50 border border-coral-200 rounded-2xl p-6 mb-8">
        <h3 className="font-semibold text-slate-900 mb-3">
          Prochaines étapes :
        </h3>
        <ul className="text-left space-y-3">
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 bg-coral-500 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
              1
            </span>
            <span className="text-slate-700">
              Complétez votre profil promoteur (logo, description, coordonnées)
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 bg-coral-500 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
              2
            </span>
            <span className="text-slate-700">
              Soumettez vos documents KYC pour la vérification
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 bg-coral-500 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
              3
            </span>
            <span className="text-slate-700">
              Publiez votre premier projet immobilier
            </span>
          </li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <a
          href={promoteurDashboardUrl}
          className="inline-flex items-center justify-center gap-2 bg-coral-500 hover:bg-coral-600 text-white font-semibold py-3 px-8 rounded-full transition-colors"
        >
          <Rocket className="w-5 h-5" />
          Accéder à mon espace promoteur
        </a>
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center justify-center gap-2 border border-slate-300 text-slate-700 font-medium py-3 px-8 rounded-full hover:bg-slate-50 transition-colors"
        >
          Retour au tableau de bord
        </button>
      </div>
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
    <div className="max-w-2xl mx-auto text-center py-12 px-4">
      <div className="w-20 h-20 bg-coral-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Crown className="w-10 h-10 text-coral-600" />
      </div>
      <h1 className="text-3xl font-bold text-slate-900 mb-4">
        Vous êtes déjà Promoteur
      </h1>
      {promoteur?.organizationName && (
        <p className="text-lg text-slate-600 mb-2">
          <span className="font-semibold">{promoteur.organizationName}</span>
        </p>
      )}
      <p className="text-slate-500 mb-8">
        Votre compte promoteur est actif. Accédez à votre espace promoteur pour
        gérer vos projets.
      </p>

      <a
        href={promoteurDashboardUrl}
        className="inline-flex items-center justify-center gap-2 bg-coral-500 hover:bg-coral-600 text-white font-semibold py-3 px-8 rounded-full transition-colors"
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
  const { data: statusData, isLoading: isStatusLoading } =
    usePromoteurStatus();

  const isSuccess = searchParams.get("session_id");
  const isCanceled = searchParams.get("canceled");

  // Loading state
  if (isStatusLoading) {
    return (
      <main className="min-h-screen bg-gray-100 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-coral-500" />
        </div>
        <Footer />
      </main>
    );
  }

  // Show success page
  if (isSuccess) {
    return (
      <main className="min-h-screen bg-gray-100">
        <SuccessView />
        <Footer />
      </main>
    );
  }

  // User is already a promoteur
  if (statusData?.isPromoteur) {
    return (
      <main className="min-h-screen bg-gray-100">
        <AlreadyPromoteurView promoteur={statusData.promoteur} />
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Canceled alert */}
      {isCanceled && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
            <XCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-700">
              Le paiement a été annulé. Vous pouvez réessayer quand vous le
              souhaitez.
            </p>
          </div>
        </div>
      )}

      {/* Section Pricing — identique au promoteur */}
      <PricingSection />

      {/* Footer */}
      <Footer />
    </main>
  );
};

export default BecomePromoteur;
