import { Link } from "react-router-dom";
import { Pencil, Target, Wallet, Home, Shield, Users } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import avatarRobert from "@/assets/avatar-robert.jpg";

/**
 * Profile Page (Mon profil - vue)
 * Affiche les informations complètes du profil utilisateur
 * Avec infos projet et accompagnements
 */

const Profile = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Section Header Profil */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          {/* Header avec avatar et bouton modifier */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <img
                src={avatarRobert}
                alt="Robert Jr"
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Robert Jr</h2>
                <span className="inline-block px-3 py-1 bg-slate-900 text-white text-xs rounded-full mt-1">
                  Investisseur
                </span>
              </div>
            </div>

            <Link
              to="/profil/edit"
              className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-6 rounded-full transition-colors self-start sm:self-auto"
            >
              <Pencil size={16} />
              Modifier mon profil
            </Link>
          </div>

          {/* Informations de contact */}
          <div className="space-y-3 text-slate-700">
            <div className="flex flex-col sm:flex-row sm:gap-2">
              <span className="font-medium text-slate-900">Email :</span>
              <span>robert.Jr@gr.com</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:gap-2">
              <span className="font-medium text-slate-900">Numéro de téléphone :</span>
              <span>+33 00 000 00</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:gap-2">
              <span className="font-medium text-slate-900">Adresse :</span>
              <span>36 Lorem , Rue 123 IV avenue</span>
            </div>
          </div>
        </div>

        {/* Section Information sur mon projet */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">
            Information sur mon projet
          </h3>

          {/* Cards info projet - fond bleu clair avec bordure rouge */}
          <div className="bg-blue-50 border-2 border-red-500 rounded-2xl p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Objectif */}
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mb-2">
                  <Target size={20} className="text-red-500" />
                </div>
                <span className="text-sm font-medium text-slate-700 mb-2">Objectif</span>
                <span className="inline-block px-4 py-1.5 bg-sky-500 text-white text-xs font-medium rounded-full">
                  Investissement
                </span>
              </div>

              {/* Paiement */}
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-2">
                  <Wallet size={20} className="text-amber-500" />
                </div>
                <span className="text-sm font-medium text-slate-700 mb-2">Paiement</span>
                <span className="inline-block px-4 py-1.5 bg-emerald-500 text-white text-xs font-medium rounded-full">
                  Crédit
                </span>
              </div>

              {/* Statut */}
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-2">
                  <Home size={20} className="text-amber-500" />
                </div>
                <span className="text-sm font-medium text-slate-700 mb-2">Statut</span>
                <span className="inline-block px-4 py-1.5 bg-red-500 text-white text-xs font-medium rounded-full">
                  Déjà investi
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section Autres informations */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Autres informations
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card Aversion au risque */}
            <div className="bg-amber-50 rounded-2xl p-6">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                <Shield size={20} className="text-amber-600" />
              </div>
              <h4 className="font-semibold text-slate-900 mb-4">Aversion au risque</h4>
              <div className="flex items-center gap-2 text-red-500">
                <div className="w-5 h-5 bg-red-100 rounded flex items-center justify-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                </div>
                <span className="font-medium">Risque moyen</span>
              </div>
            </div>

            {/* Card Mes accompagnements */}
            <div className="bg-blue-50 rounded-2xl p-6">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                <Users size={20} className="text-amber-600" />
              </div>
              <h4 className="font-semibold text-slate-900 mb-4">Mes accompagnements</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-emerald-600">
                  <div className="w-4 h-4 bg-emerald-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span>Avocat</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-600">
                  <div className="w-4 h-4 bg-emerald-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span>Architecte</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-600">
                  <div className="w-4 h-4 bg-emerald-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span>Notaire</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
