import { Upload, ChevronDown, Crown, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import avatarRobert from "@/assets/avatar-robert.svg";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useClientProfile, useUpdateClientProfile, usePromoteurStatus } from "@/hooks/useApi";
import { toast } from "sonner";

/**
 * ProfileEdit Page (Modifier mon profil)
 * Formulaire complet d'édition du profil utilisateur
 * Avec sections: infos personnelles, infos projet, accompagnements
 */

const ProfileEdit = () => {
  const { user, refreshProfile } = useAuth();
  const { data: profile } = useClientProfile();
  const updateProfile = useUpdateClientProfile();
  const { data: promoteurStatus } = usePromoteurStatus();

  // État du formulaire
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    residence: "Paris, France",
    adresse: "",
    objectif: [] as string[],
    modePaiement: "comptant",
    dejaInvesti: "oui",
    aversionRisque: "",
    accompagnements: [] as string[],
  });

  // Pré-remplir le formulaire avec les données utilisateur et profil
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      nom: user?.lastName || prev.nom,
      prenom: user?.firstName || prev.prenom,
      email: user?.email || prev.email,
      telephone: user?.phone || profile?.telephone || prev.telephone,
      adresse: profile?.adresse || prev.adresse,
      residence: profile?.residence || prev.residence,
      objectif: profile?.objectif || prev.objectif,
      modePaiement: profile?.modePaiement || prev.modePaiement,
      dejaInvesti: profile?.dejaInvesti === true ? 'oui' : profile?.dejaInvesti === false ? 'non' : (profile?.dejaInvesti as string) || prev.dejaInvesti,
      aversionRisque: profile?.aversionRisque || prev.aversionRisque,
      accompagnements: profile?.accompagnements || prev.accompagnements,
    }));
  }, [user, profile]);

  // Handler pour les checkboxes
  const handleCheckbox = (field: "objectif" | "accompagnements", value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  };

  // Handler pour soumettre le formulaire
  const handleSubmit = async () => {
    try {
      await updateProfile.mutateAsync({
        firstName: formData.prenom,
        lastName: formData.nom,
        phone: formData.telephone,
        adresse: formData.adresse,
        residence: formData.residence,
        objectif: formData.objectif,
        modePaiement: formData.modePaiement,
        dejaInvesti: formData.dejaInvesti,
        aversionRisque: formData.aversionRisque,
        accompagnements: formData.accompagnements,
      });
      refreshProfile();
      toast.success('Profil mis à jour avec succès');
    } catch {
      toast.error('Erreur lors de la mise à jour du profil');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        {/* Section Photo de profil */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={user?.avatar || avatarRobert}
                alt="Photo de profil"
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Photo de</h2>
                <p className="text-slate-500">profil</p>
              </div>
            </div>

            <button className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-6 rounded-full transition-colors self-start sm:self-auto">
              <Upload size={18} />
              Importer une photo
            </button>
          </div>
        </div>

        {/* Section Informations personnelles */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">
            Informations personnelles
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="w-full px-4 py-3 bg-[#007BFF0A] rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Prénom */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Prénom(s)<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                className="w-full px-4 py-3 bg-[#007BFF0A] rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-[#007BFF0A] rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Téléphone<span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                className="w-full px-4 py-3 bg-[#007BFF0A] rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Résidence */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Résidence
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <span className="text-lg">🇫🇷</span>
                </div>
                <select
                  value={formData.residence}
                  onChange={(e) => setFormData({ ...formData, residence: e.target.value })}
                  className="w-full pl-12 pr-10 py-3 bg-white border border-slate-200 text-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none"
                >
                  <option value="Paris, France">Paris, France</option>
                  <option value="Lyon, France">Lyon, France</option>
                  <option value="Marseille, France">Marseille, France</option>
                </select>
                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Adresse */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Adresse
              </label>
              <input
                type="text"
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                className="w-full px-4 py-3 bg-[#007BFF0A] rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Section Informations sur le projet */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">
            Informations sur le projet
          </h3>

          {/* Qu'est-ce que vous recherchez ? */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              Qu'est-ce que vous recherchez ?
            </label>
            <div className="flex flex-wrap gap-4">
              {["Investissement", "Résidence principale", "Résidence secondaire"].map((option) => (
                <label key={option} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.objectif.includes(option)}
                    onChange={() => handleCheckbox("objectif", option)}
                    className="w-4 h-4 rounded bg-[#F5FAFF] border-slate-300 text-sky-500 focus:ring-sky-500"
                  />
                  <span className="text-sm text-slate-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Mode de paiement & Déjà investi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Mode de paiement */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                Mode de paiement
              </label>
              <div className="flex gap-6">
                {["Comptant", "Crédit"].map((option) => (
                  <label key={option} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="modePaiement"
                      value={option.toLowerCase()}
                      checked={formData.modePaiement === option.toLowerCase()}
                      onChange={(e) => setFormData({ ...formData, modePaiement: e.target.value })}
                      className="w-4 h-4 border-slate-300 text-sky-500 focus:ring-sky-500"
                    />
                    <span className="text-sm text-slate-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Avez-vous déjà investi ? */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                Avez-vous déjà investi ?
              </label>
              <div className="flex gap-6">
                {["Oui", "Non"].map((option) => (
                  <label key={option} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="dejaInvesti"
                      value={option.toLowerCase()}
                      checked={formData.dejaInvesti === option.toLowerCase()}
                      onChange={(e) => setFormData({ ...formData, dejaInvesti: e.target.value })}
                      className="w-4 h-4 border-slate-300 text-sky-500 focus:ring-sky-500"
                    />
                    <span className="text-sm text-slate-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Aversion au risque */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              Aversion au risque
            </label>
            <div className="flex flex-wrap gap-4">
              {[
                "Je ne prends pas de risques",
                "Risque moyen",
                "Beaucoup de risques pour plus de profits",
              ].map((option) => (
                <label key={option} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.aversionRisque === option}
                    onChange={() =>
                      setFormData({
                        ...formData,
                        aversionRisque: formData.aversionRisque === option ? "" : option,
                      })
                    }
                    className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
                  />
                  <span className="text-sm text-slate-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Mes accompagnements */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              Mes accompagnements
            </label>
            <div className="flex flex-wrap gap-4">
              {[
                "Notaire",
                "Avocat",
                "Architecte",
                "Société BTP",
                "Non je ne souhaite pas être accompagné",
              ].map((option) => (
                <label key={option} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.accompagnements.includes(option)}
                    onChange={() => handleCheckbox("accompagnements", option)}
                    className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
                  />
                  <span className="text-sm text-slate-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Bannière Devenir Promoteur */}
        {!promoteurStatus?.isPromoteur && (
          <div className="bg-gradient-to-r from-coral-500 to-amber-500 rounded-2xl p-6 shadow-sm mb-6 text-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">Vous souhaitez vendre vos projets ?</h3>
                  <p className="text-sm text-coral-100">
                    Devenez promoteur et accédez à un espace dédié pour publier vos projets, gérer vos leads et développer votre activité.
                  </p>
                </div>
              </div>
              <Link
                to="/devenir-promoteur"
                className="inline-flex items-center gap-2 bg-white text-coral-600 font-semibold px-6 py-3 rounded-full hover:bg-coral-50 transition-colors text-sm shrink-0"
              >
                <Crown className="w-4 h-4" />
                Devenir Promoteur
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Bouton Mettre à jour */}
        <div className="text-center">
          <button
            onClick={handleSubmit}
            disabled={updateProfile.isPending}
            className="bg-[#007BFF] hover:bg-[#007BFF] text-white font-medium py-3 px-8 rounded-full transition-colors disabled:opacity-50"
          >
            {updateProfile.isPending ? 'Mise à jour...' : 'Mettre à jours mon profil'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfileEdit;
