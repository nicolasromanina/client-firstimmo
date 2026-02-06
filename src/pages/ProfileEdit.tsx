import { Upload, ChevronDown } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import avatarRobert from "@/assets/avatar-robert.jpg";
import { useState } from "react";

/**
 * ProfileEdit Page (Modifier mon profil)
 * Formulaire complet d'édition du profil utilisateur
 * Avec sections: infos personnelles, infos projet, accompagnements
 */

const ProfileEdit = () => {
  // État du formulaire
  const [formData, setFormData] = useState({
    nom: "Robert",
    prenom: "Jr",
    email: "robert.Jr@gr.com",
    telephone: "+33 00 000 00",
    residence: "Paris, France",
    adresse: "36 Lorem , Rue 123 IV avenue",
    objectif: [] as string[],
    modePaiement: "comptant",
    dejaInvesti: "oui",
    aversionRisque: "",
    accompagnements: [] as string[],
  });

  // Handler pour les checkboxes
  const handleCheckbox = (field: "objectif" | "accompagnements", value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        {/* Section Photo de profil */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={avatarRobert}
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
                className="w-full px-4 py-3 bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
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
                className="w-full px-4 py-3 bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
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
                className="w-full px-4 py-3 bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
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
                className="w-full px-4 py-3 bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
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
                className="w-full px-4 py-3 bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
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
                    className="w-5 h-5 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
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
                      className="w-5 h-5 border-slate-300 text-sky-500 focus:ring-sky-500"
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
                      className="w-5 h-5 border-slate-300 text-sky-500 focus:ring-sky-500"
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
                    className="w-5 h-5 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
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
                    className="w-5 h-5 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
                  />
                  <span className="text-sm text-slate-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Bouton Mettre à jour */}
        <div className="text-center">
          <button className="bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-8 rounded-full transition-colors">
            Mettre à jours mon profil
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfileEdit;
