import { Link } from "react-router-dom";
import { Pencil, TrendingUp, CreditCard, Shield, Users } from "lucide-react";
import avatarRobert from "@/assets/avatar-robert.jpg";

/**
 * UserProfileCard Component
 * Carte de profil utilisateur avec avatar, nom, badge et caractéristiques
 * Affichée sur le Dashboard
 */

const UserProfileCard = () => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      {/* Header avec avatar et nom */}
      <div className="flex items-center gap-4 mb-6">
        <img
          src={avatarRobert}
          alt="Robert Jr"
          className="w-14 h-14 rounded-full object-cover"
        />
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Robert Jr</h2>
          <span className="inline-block px-3 py-1 bg-slate-900 text-white text-xs rounded-full mt-1">
            Investisseur
          </span>
        </div>
      </div>

      {/* Caractéristiques du profil */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Investissement */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-emerald-100 rounded flex items-center justify-center">
            <TrendingUp size={14} className="text-emerald-600" />
          </div>
          <span className="text-sm text-slate-700">Investissement</span>
        </div>

        {/* Credit */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-amber-100 rounded flex items-center justify-center">
            <CreditCard size={14} className="text-amber-600" />
          </div>
          <span className="text-sm text-slate-700">Credit</span>
        </div>

        {/* Risque moyen */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center">
            <Shield size={14} className="text-slate-600" />
          </div>
          <span className="text-sm text-slate-700">Risque moyen</span>
        </div>

        {/* Accompagnement */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center">
            <Users size={14} className="text-slate-600" />
          </div>
          <span className="text-sm text-slate-700">Accompagnement(3)</span>
        </div>
      </div>

      {/* Bouton Modifier mon profil */}
      <Link
        to="/profil/edit"
        className="flex items-center justify-center gap-2 w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-6 rounded-full transition-colors"
      >
        Modifier mon profil
        <Pencil size={16} />
      </Link>
    </div>
  );
};

export default UserProfileCard;
