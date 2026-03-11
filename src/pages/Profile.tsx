import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import avatarRobert from "@/assets/avatar-robert.svg";
import profileEdit from "@/assets/profil-edit.png";
import moneyInvest from "@/assets/money-invest.svg";
import moneyCredit from "@/assets/money-credit.svg";
import objectifIcon from "@/assets/objectif.svg";
import riskIcon from "@/assets/risk-icon.svg";
import aversionIcon from "@/assets/aversion.svg";
import accompagnementIcon from "@/assets/accompagnement.svg";
import { useAuth } from "@/hooks/useAuth";
import { useClientProfile, useOnboardingData } from "@/hooks/useApi";

/**
 * Profile Page (Mon profil - vue)
 * Affiche les informations complètes du profil utilisateur
 * Avec infos projet et accompagnements
 */

const Profile = () => {
  const { user } = useAuth();
  const { data: profile } = useClientProfile();
  const { data: onboardingData } = useOnboardingData();
  const userClientProfile = user?.clientProfile;

  const firstName = onboardingData?.step1?.prenom || profile?.firstName || user?.firstName || "";
  const lastName = onboardingData?.step1?.nom || profile?.lastName || user?.lastName || "";
  const displayName = `${firstName} ${lastName}`.trim() || user?.email?.split("@")[0] || "Utilisateur";

  const userEmail = onboardingData?.step1?.email || profile?.email || user?.email || "Non renseigné";
  const userPhone = onboardingData?.step1?.telephone || profile?.phone || user?.phone || "Non renseigné";
  const userAddress = onboardingData?.step1?.adresse || profile?.address || userClientProfile?.address || "Non renseignée";
  const residence = onboardingData?.step1?.residence || profile?.residence || userClientProfile?.residence || "Non renseignée";

  const objectifsSource = onboardingData?.step1?.objectif ?? profile?.objectif ?? userClientProfile?.objectif;
  const objectifs = objectifsSource && objectifsSource.length > 0 ? [objectifsSource] : ["Non renseigné"];

  const rechercheSource = onboardingData?.step2?.recherche;
  const recherche = Array.isArray(rechercheSource) && rechercheSource.length > 0 ? rechercheSource : ["Non renseigné"];

  const paiementRaw = String(onboardingData?.step3?.modePaiement || profile?.modePaiement || userClientProfile?.modePaiement || "").toLowerCase();
  const paiementLabel =
    paiementRaw === "credit" || paiementRaw === "crédit"
      ? "Crédit"
      : paiementRaw === "comptant"
      ? "Comptant"
      : "Non renseigné";

  const investiValue = (onboardingData?.step3?.dejaInvesti ?? profile?.dejaInvesti ?? userClientProfile?.dejaInvesti) as any;
  const investiLabel =
    investiValue === "oui" || investiValue === true
      ? "Déjà investi"
      : investiValue === "non" || investiValue === false
      ? "Pas encore"
      : "Non renseigné";

  const riskLabel = onboardingData?.step3?.aversionRisque || profile?.aversionRisque || userClientProfile?.aversionRisque || "Non renseigné";
  const accompagnementsSource = onboardingData?.step3?.partenaires ?? profile?.accompagnements ?? userClientProfile?.accompagnements;
  const accompagnements =
    Array.isArray(accompagnementsSource) && accompagnementsSource.length > 0
      ? accompagnementsSource
      : ["Non renseigné"];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <img src={user?.avatar || avatarRobert} alt={displayName} className="w-16 h-16 rounded-full object-cover" />
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{displayName}</h2>
                <span className="inline-block px-3 py-1 bg-slate-900 text-white text-xs rounded-full mt-1">Investisseur</span>
              </div>
            </div>

            <Link
              to="/profil/edit"
              className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-6 rounded-full transition-colors self-start sm:self-auto"
            >
              <img src={profileEdit} alt="Modifier" />
              Modifier mon profil
            </Link>
          </div>

          <div className="space-y-3 text-slate-700">
            <div className="flex flex-col sm:flex-row sm:gap-2">
              <span className="font-medium text-slate-900">Email :</span>
              <span>{userEmail}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:gap-2">
              <span className="font-medium text-slate-900">Numéro de téléphone :</span>
              <span>{userPhone}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:gap-2">
              <span className="font-medium text-slate-900">Adresse :</span>
              <span>{userAddress}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:gap-2">
              <span className="font-medium text-slate-900">Résidence :</span>
              <span>{residence}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Information sur mon projet</h3>

          <div className="bg-blue-50 border-2 rounded-2xl p-6 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-2">
                  <span className="text-lg font-semibold text-sky-600">🔍</span>
                </div>
                <span className="text-sm font-medium text-slate-700 mb-2">Qu'est-ce que vous recherchez ?</span>
                <div className="flex flex-wrap justify-center gap-2">
                  {recherche.map((r) => (
                    <span key={r} className="inline-block px-4 py-1.5 bg-sky-500 text-white text-xs font-medium rounded-full">
                      {r}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-2">
                  <img src={objectifIcon} alt="Objectif" className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-slate-700 mb-2">Objectif</span>
                <div className="flex flex-wrap justify-center gap-2">
                  {objectifs.map((obj) => (
                    <span key={obj} className="inline-block px-4 py-1.5 bg-sky-500 text-white text-xs font-medium rounded-full">
                      {obj}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-2">
                  <img src={moneyCredit} alt="Paiement" className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-slate-700 mb-2">Paiement</span>
                <span className="inline-block px-4 py-1.5 bg-emerald-500 text-white text-xs font-medium rounded-full">
                  {paiementLabel}
                </span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-2">
                  <img src={moneyInvest} alt="Investissement" className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-slate-700 mb-2">Statut</span>
                <span className="inline-block px-4 py-1.5 bg-red-500 text-white text-xs font-medium rounded-full">
                  {investiLabel}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Autres informations</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-amber-50 rounded-2xl p-6">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                <img src={aversionIcon} alt="Aversion au risque" className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-slate-900 mb-4">Aversion au risque</h4>
              <div className="flex items-center gap-2 text-red-500">
                <div className="w-5 h-5 rounded flex items-center justify-center">
                  <img src={riskIcon} alt="Aversion au risque" className="w-5 h-5" />
                </div>
                <span className="font-medium">{riskLabel}</span>
              </div>
            </div>

            <div className="bg-blue-50 rounded-2xl p-6">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                <img src={accompagnementIcon} alt="Accompagnement" className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-slate-900 mb-4">Mes accompagnements</h4>
              <div className="space-y-2">
                {accompagnements.map((acc: string) => (
                  <div key={acc} className="flex items-center gap-2 text-emerald-600">
                    <div className="w-4 h-4 bg-emerald-500 rounded flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span>{acc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
