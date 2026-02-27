import DashboardLayout from "@/components/layout/DashboardLayout";
import UserProfileCard from "@/components/dashboard/UserProfileCard";
import ConsultedProjects from "@/components/dashboard/ConsultedProjects";
import { Link } from "react-router-dom";
import { ChevronRight, Crown } from "lucide-react";
import { usePromoteurStatus } from "@/hooks/useApi";

/**
 * Dashboard Page (Tableau de bord)
 * Page d'accueil principale affichant:
 * - Carte profil utilisateur
 * - Documents récents
 * - Projets consultés
 */

const Dashboard = () => {
  const { data: promoteurStatus } = usePromoteurStatus();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Section supérieure: Profil + Devenir Promoteur */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UserProfileCard />
          {!promoteurStatus?.isPromoteur ? (
            <div className="bg-gradient-to-r from-coral-500 to-amber-500 rounded-2xl shadow-sm p-6 text-white transition-colors duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-white/20">
                  <Crown className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold">Devenir Promoteur</h2>
              </div>
              <p className="text-sm text-coral-100 mb-4">
                Passez au niveau supérieur ! Publiez vos projets immobiliers, recevez des leads qualifiés
                et développez votre activité sur notre plateforme.
              </p>
              <Link
                to="/devenir-promoteur"
                className="inline-flex items-center gap-2 bg-white text-coral-600 font-semibold px-6 py-2.5 rounded-lg hover:bg-coral-50 transition-colors text-sm"
              >
                <Crown className="w-4 h-4" />
                Devenir Promoteur
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 transition-colors duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-green-100 text-green-600">
                  <Crown className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900">Compte Promoteur</h2>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Votre compte promoteur est actif. Accédez à votre espace dédié.
              </p>
              <a
                href={import.meta.env.VITE_PROMOTEUR_URL || "http://localhost:8081"}
                className="inline-flex items-center gap-2 bg-coral-500 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-coral-600 transition-colors text-sm"
              >
                Ouvrir l'espace promoteur
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>

        {/* Section Projets Consultés */}
        <ConsultedProjects />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
