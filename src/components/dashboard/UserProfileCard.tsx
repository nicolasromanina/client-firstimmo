import { Link } from "react-router-dom";
import { Pencil, TrendingUp, CreditCard, Shield, Users } from "lucide-react";
import avatarRobert from "@/assets/avatar-robert.png";
import invest from "@/assets/invest-icon.svg";
import credit from "@/assets/credit-icon.svg";
import risk from "@/assets/average-irsk-icon.svg";
import accompagnement from "@/assets/accompagnement-icon.svg";
import edit from "@/assets/profil-edit.png";
import { useAuth } from "@/hooks/useAuth";
import { useClientProfile } from "@/hooks/useApi";
/**
 * UserProfileCard Component
 * Carte de profil utilisateur avec avatar, nom, badge et caractéristiques
 * Affichée sur le Dashboard
 */

const UserProfileCard = () => {
  const { user } = useAuth();
  const { data: profile } = useClientProfile();

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName ?? ''}`.trim()
    : user?.email?.split('@')[0] ?? 'Utilisateur';

  const riskLabel = profile?.aversionRisque || 'Risque moyen';
  const accompagnementCount = profile?.accompagnements?.length ?? 0;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      {/* Header avec avatar et nom */}
      <div className="flex items-center gap-4 mb-6">
        <img
          src={user?.avatar || avatarRobert}
          alt={displayName}
          className="w-14 h-14 rounded-full object-cover"
        />
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{displayName}</h2>
          <span className="inline-block px-3 py-1 bg-slate-900 text-white text-xs rounded-full mt-1">
            Investisseur
          </span>
        </div>
      </div>

      {/* Caractéristiques du profil */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Investissement */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6  rounded flex items-center justify-center">
            <img src={invest} alt="Investissement" className="w-4 h-4" />
          </div>
          <span className="text-sm text-slate-700">Investissement</span>
        </div>

        {/* Credit */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6  rounded flex items-center justify-center">
            <img src={credit} alt="Credit" className="w-4 h-4" />
          </div>
          <span className="text-sm text-slate-700">{profile?.modePaiement === 'crédit' ? 'Crédit' : 'Credit'}</span>
        </div>

        {/* Risque moyen */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6  rounded flex items-center justify-center">
            <img src={risk} alt="Risque moyen" className="w-4 h-4" />
          </div>
          <span className="text-sm text-slate-700">{riskLabel}</span>
        </div>

        {/* Accompagnement */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6  rounded flex items-center justify-center">
            <img src={accompagnement} alt="Accompagnement" className="w-4 h-4" />
          </div>
          <span className="text-sm text-slate-700">Accompagnement({accompagnementCount})</span>
        </div>
      </div>

      {/* Bouton Modifier mon profil */}
      <Link
        to="/profil/edit"
        className="flex items-center justify-center gap-2 w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-6 rounded-full transition-colors"
      >
        Modifier mon profil
        <img src={edit} alt="Modifier" className="w-4 h-4" />
      </Link>
    </div>
  );
};

export default UserProfileCard;
