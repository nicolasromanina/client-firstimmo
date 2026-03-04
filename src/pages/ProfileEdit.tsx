import { Upload, ChevronDown, Crown, ArrowRight, Loader } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import avatarRobert from "@/assets/avatar-robert.svg";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useClientProfile, useUpdateClientProfile, usePromoteurStatus } from "@/hooks/useApi";
import { uploadFile } from "@/lib/api";
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
    address: "",
    objectif: [] as string[],
    modePaiement: "comptant",
    dejaInvesti: "oui",
    aversionRisque: "",
    accompagnements: [] as string[],
  });
  const [fieldErrors, setFieldErrors] = useState<{ nom?: string; prenom?: string; email?: string; telephone?: string }>({});
  
  // État pour le changement d'avatar
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const userClientProfile = user?.clientProfile;

  const normalizePaymentMode = (value: string | undefined): string => {
    const raw = String(value || "").trim().toLowerCase();
    if (raw === "crédit" || raw === "credit") return "credit";
    if (raw === "comptant") return "comptant";
    return "comptant";
  };

  const normalizeDejaInvesti = (value: unknown): "oui" | "non" => {
    if (value === true || String(value || "").toLowerCase() === "oui") return "oui";
    if (value === false || String(value || "").toLowerCase() === "non") return "non";
    return "oui";
  };

  const normalizeObjectifs = (values: unknown): string[] => {
    if (!Array.isArray(values)) return [];
    const mapped = values.map((v) => {
      const raw = String(v || "").trim().toLowerCase();
      if (raw.includes("invest")) return "Investissement";
      if (raw.includes("princip")) return "Residence principale";
      if (raw.includes("second")) return "Residence secondaire";
      return String(v || "").trim();
    });
    return Array.from(new Set(mapped.filter(Boolean)));
  };

  const normalizeAccompagnements = (values: unknown): string[] => {
    if (!Array.isArray(values)) return [];
    const mapped = values.map((v) => {
      const raw = String(v || "").trim().toLowerCase();
      if (raw.includes("soc") && raw.includes("btp")) return "Societe BTP";
      if (raw === "non je ne souhaite pas etre accompagne" || raw === "non") return "Non";
      if (raw.includes("notaire")) return "Notaire";
      if (raw.includes("avocat")) return "Avocat";
      if (raw.includes("architect")) return "Architecte";
      return String(v || "").trim();
    });
    return Array.from(new Set(mapped.filter(Boolean)));
  };

  const validateNom = (value: string): string | null => {
    const v = value.trim();
    if (!v) return "Le nom est requis.";
    if (v.length < 2) return "Le nom doit contenir au moins 2 caractères.";
    if (v.length > 50) return "Le nom ne peut pas dépasser 50 caractères.";
    if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(v)) return "Le nom contient des caractères invalides.";
    if (/\d/.test(v)) return "Le nom ne peut pas contenir de chiffres.";
    return null;
  };

  const validatePrenom = (value: string): string | null => {
    const v = value.trim();
    if (!v) return "Le prénom est requis.";
    if (v.length < 2) return "Le prénom doit contenir au moins 2 caractères.";
    if (v.length > 50) return "Le prénom ne peut pas dépasser 50 caractères.";
    if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(v)) return "Le prénom contient des caractères invalides.";
    if (/\d/.test(v)) return "Le prénom ne peut pas contenir de chiffres.";
    return null;
  };

  const validateEmail = (value: string): string | null => {
    const v = value.trim().toLowerCase();
    if (!v) return null;
    
    // Validation RFC 5322 simplifiée
    const emailRegex = /^[^\s@][^\s@]*@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(v)) return "Adresse email invalide.";
    
    // Vérifications supplémentaires
    if (v.length > 254) return "Adresse email trop longue (max. 254 caractères).";
    if (v.startsWith('.') || v.endsWith('.')) return "L'email ne peut pas commencer ou finir par un point.";
    if (v.includes('..')) return "L'email ne peut pas contenir deux points consécutifs.";
    
    const [local, domain] = v.split('@');
    if (!local || local.length > 64) return "La partie avant @ est trop longue (max. 64 caractères).";
    if (!domain || domain.length > 255) return "Le domaine est trop long (max. 255 caractères).";
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) return "Le domaine est invalide.";
    if (domain.startsWith('-') || domain.endsWith('-')) return "Le domaine ne peut pas commencer ou finir par un tiret.";
    if (domain.includes('..')) return "Le domaine ne peut pas contenir deux points consécutifs.";
    
    return null;
  };

  const validatePhone = (value: string): string | null => {
    const v = value.trim();
    if (!v) return "Le numéro de téléphone est requis.";
    
    // Caractères autorisés : chiffres, +, espaces, parenthèses, tirets
    const allowed = /^[0-9+\s().\-]+$/;
    if (!allowed.test(v)) return "Le numéro contient des caractères invalides.";
    
    // Extraire seulement les chiffres pour compter
    const digits = v.replace(/\D/g, "");
    if (digits.length < 8) return "Le numéro doit contenir au moins 8 chiffres.";
    if (digits.length > 15) return "Le numéro ne peut pas dépasser 15 chiffres.";
    
    // Vérifier que ce n'est pas juste des 0 ou des 1
    if (/^[01]+$/.test(digits)) return "Le numéro est invalide.";
    
    // Limiter la longueur totale (avec formatage)
    if (v.length > 25) return "Le numéro est trop long.";
    
    return null;
  };

  const validateForm = () => {
    const nomError = validateNom(formData.nom);
    const prenomError = validatePrenom(formData.prenom);
    const emailError = validateEmail(formData.email);
    const phoneError = validatePhone(formData.telephone);
    const nextErrors: { nom?: string; prenom?: string; email?: string; telephone?: string } = {};
    if (nomError) nextErrors.nom = nomError;
    if (prenomError) nextErrors.prenom = prenomError;
    if (emailError) nextErrors.email = emailError;
    if (phoneError) nextErrors.telephone = phoneError;
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  // Pré-remplir le formulaire avec les données utilisateur et profil
  useEffect(() => {
    const objectifs = normalizeObjectifs(profile?.objectif ?? userClientProfile?.objectif);
    const accompagnements = normalizeAccompagnements(profile?.accompagnements ?? userClientProfile?.accompagnements);
    setFormData((prev) => ({
      ...prev,
      nom: user?.lastName || prev.nom,
      prenom: user?.firstName || prev.prenom,
      email: user?.email || prev.email,
      telephone: profile?.phone || user?.phone || prev.telephone,
      address: profile?.address || userClientProfile?.address || prev.address,
      residence: profile?.residence || userClientProfile?.residence || prev.residence,
      objectif: objectifs.length > 0 ? objectifs : prev.objectif,
      modePaiement: normalizePaymentMode(profile?.modePaiement ?? userClientProfile?.modePaiement ?? prev.modePaiement),
      dejaInvesti: normalizeDejaInvesti(profile?.dejaInvesti ?? userClientProfile?.dejaInvesti ?? prev.dejaInvesti),
      aversionRisque: profile?.aversionRisque || userClientProfile?.aversionRisque || prev.aversionRisque,
      accompagnements: accompagnements.length > 0 ? accompagnements : prev.accompagnements,
    }));
  }, [user, profile, userClientProfile]);

  // Handler pour les checkboxes
  const handleCheckbox = (field: "objectif" | "accompagnements", value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  };

  // Handler pour le changement d'avatar
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image valide.');
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 5MB.');
      return;
    }

    // Créer une aperçu local
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload l'avatar
    try {
      setIsUploadingAvatar(true);
      const formDataObj = new FormData();
      formDataObj.append('avatar', file);

      const response = await uploadFile('/api/client/avatar', formDataObj, 'PUT');

      if (response.data?.avatar) {
        setAvatarPreview(response.data.avatar);
        await refreshProfile();
        toast.success('Avatar mis à jour avec succès!');
      }
    } catch (error) {
      console.error('Erreur upload avatar:', error);
      toast.error('Erreur lors du téléchargement de l\'avatar.');
      setAvatarPreview(null);
    } finally {
      setIsUploadingAvatar(false);
      // Réinitialiser l'input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handler pour soumettre le formulaire
  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Veuillez corriger les champs invalides.");
      return;
    }
    try {
      const dejaInvestiValue = formData.dejaInvesti === "oui" ? true : (formData.dejaInvesti === "non" ? false : undefined);
      
      await updateProfile.mutateAsync({
        firstName: formData.prenom,
        lastName: formData.nom,
        phone: formData.telephone,
        address: formData.address,
        residence: formData.residence,
        objectif: normalizeObjectifs(formData.objectif),
        modePaiement: normalizePaymentMode(formData.modePaiement),
        dejaInvesti: dejaInvestiValue as any,
        aversionRisque: formData.aversionRisque,
        accompagnements: normalizeAccompagnements(formData.accompagnements),
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
                src={avatarPreview || user?.avatar || avatarRobert}
                alt="Photo de profil"
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Photo de</h2>
                <p className="text-slate-500">profil</p>
              </div>
            </div>

            <button
              onClick={handleAvatarClick}
              disabled={isUploadingAvatar}
              className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-full transition-colors self-start sm:self-auto"
            >
              {isUploadingAvatar ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Téléchargement...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Importer une photo
                </>
              )}
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
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
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, nom: value });
                  if (fieldErrors.nom) setFieldErrors((prev) => ({ ...prev, nom: undefined }));
                }}
                onBlur={() => {
                  const err = validateNom(formData.nom);
                  setFieldErrors((prev) => ({ ...prev, nom: err || undefined }));
                }}
                maxLength={50}
                className={`w-full px-4 py-3 bg-[#007BFF0A] rounded-lg focus:outline-none focus:ring-2 ${
                  fieldErrors.nom ? "ring-2 ring-red-400" : "focus:ring-sky-500"
                }`}
              />
              {fieldErrors.nom && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.nom}</p>
              )}
            </div>

            {/* Prénom */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Prénom(s) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.prenom}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, prenom: value });
                  if (fieldErrors.prenom) setFieldErrors((prev) => ({ ...prev, prenom: undefined }));
                }}
                onBlur={() => {
                  const err = validatePrenom(formData.prenom);
                  setFieldErrors((prev) => ({ ...prev, prenom: err || undefined }));
                }}
                maxLength={50}
                className={`w-full px-4 py-3 bg-[#007BFF0A] rounded-lg focus:outline-none focus:ring-2 ${
                  fieldErrors.prenom ? "ring-2 ring-red-400" : "focus:ring-sky-500"
                }`}
              />
              {fieldErrors.prenom && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.prenom}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, email: value });
                  if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }}
                onBlur={() => {
                  const err = validateEmail(formData.email);
                  setFieldErrors((prev) => ({ ...prev, email: err || undefined }));
                }}
                maxLength={254}
                className={`w-full px-4 py-3 bg-[#007BFF0A] rounded-lg focus:outline-none focus:ring-2 ${
                  fieldErrors.email ? "ring-2 ring-red-400" : "focus:ring-sky-500"
                }`}
              />
              {fieldErrors.email && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>
              )}
              {formData.email && !fieldErrors.email && (
                <p className="text-xs text-green-600 mt-1">✓ Email valide</p>
              )}
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Téléphone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.telephone}
                onChange={(e) => {
                  const value = e.target.value;
                  // Limiter à 25 caractères max pour éviter les abus
                  if (value.length <= 25) {
                    setFormData({ ...formData, telephone: value });
                    if (fieldErrors.telephone) setFieldErrors((prev) => ({ ...prev, telephone: undefined }));
                  }
                }}
                onBlur={() => {
                  const err = validatePhone(formData.telephone);
                  setFieldErrors((prev) => ({ ...prev, telephone: err || undefined }));
                }}
                maxLength={25}
                placeholder="+33 1 23 45 67 89 ou 0123456789"
                className={`w-full px-4 py-3 bg-[#007BFF0A] rounded-lg focus:outline-none focus:ring-2 ${
                  fieldErrors.telephone ? "ring-2 ring-red-400" : "focus:ring-sky-500"
                }`}
              />
              {fieldErrors.telephone && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.telephone}</p>
              )}
              {formData.telephone && !fieldErrors.telephone && (
                <p className="text-xs text-green-600 mt-1">✓ Téléphone valide ({formData.telephone.replace(/\D/g, "").length} chiffres)</p>
              )}
            </div>

            {/* Résidence */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Résidence
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <span className="text-lg">📍</span>
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
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
              {["Investissement", "Residence principale", "Residence secondaire"].map((option) => (
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mode de paiement */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                Mode de paiement
              </label>
              <div className="flex gap-6">
                {["Comptant", "Credit"].map((option) => (
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
        </div>

        {/* Section Autres informations */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">
            Autres informations
          </h3>

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
                "Societe BTP",
                "Non",
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
            className="bg-[#007BFF] hover:bg-[#0056b3] text-white font-medium py-3 px-8 rounded-full transition-colors disabled:opacity-50"
          >
            {updateProfile.isPending ? 'Mise à jour...' : 'Mettre à jour mon profil'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfileEdit;

