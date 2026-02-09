import { useState } from "react";
import { MapPin, Phone, MoreVertical, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import partnerMarie1 from "@/assets/partner-marie-1.jpg";
import partnerMarie2 from "@/assets/partner-marie-2.jpg";
import partnerMarie3 from "@/assets/partner-marie-3.jpg";
import localisationIcon from "@/assets/localisation-icon.svg";
import callIcon from "@/assets/call.svg";
import { usePartners } from "@/hooks/useApi";
/**
 * Partners Page (Mes partenaires)
 * Liste des partenaires professionnels avec filtres
 */

interface Partner {
  id: string | number;
  avatar: string;
  name: string;
  role: string;
  roleColor: string;
  borderColor: string;
  description: string;
  specialty: string;
  location: string;
  phone: string;
}

const fallbackAvatars = [partnerMarie1, partnerMarie2, partnerMarie3];

const roleColorMap: Record<string, { roleColor: string; borderColor: string }> = {
  'conseille juridique': { roleColor: 'text-red-500', borderColor: 'border-red-400' },
  'avocat': { roleColor: 'text-green-500', borderColor: 'border-sky-400' },
  'notaire': { roleColor: 'text-slate-500', borderColor: 'border-amber-400' },
  'architecte': { roleColor: 'text-sky-500', borderColor: 'border-sky-400' },
  'société btp': { roleColor: 'text-amber-500', borderColor: 'border-amber-400' },
};

const fallbackPartners: Partner[] = [
  {
    id: 1,
    avatar: partnerMarie1,
    name: "Marie H",
    role: "Conseille juridique",
    roleColor: "text-red-500",
    borderColor: "border-red-400",
    description:
      "Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos",
    specialty: "Spécialiste en investissement immobilier",
    location: "Paris",
    phone: "+33 00 000 00",
  },
  {
    id: 2,
    avatar: partnerMarie2,
    name: "Marie H",
    role: "Avocat",
    roleColor: "text-green-500",
    borderColor: "border-sky-400",
    description:
      "Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos",
    specialty: "Spécialiste en investissement immobilier",
    location: "Paris",
    phone: "+33 00 000 00",
  },
  {
    id: 3,
    avatar: partnerMarie3,
    name: "Marie H",
    role: "Notaire",
    roleColor: "text-slate-500",
    borderColor: "border-amber-400",
    description:
      "Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos",
    specialty: "Spécialiste en investissement immobilier",
    location: "Paris",
    phone: "+33 00 000 00",
  },
];

type FilterCategory = "notaire" | "avocats" | "btp" | "architectes";

const filterTypeMap: Record<FilterCategory, string> = {
  notaire: 'notaire',
  avocats: 'avocat',
  btp: 'btp',
  architectes: 'architecte',
};

const Partners = () => {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("notaire");
  const { data: apiPartners, isLoading } = usePartners({ type: filterTypeMap[activeFilter] });

  const partners: Partner[] = apiPartners && apiPartners.length > 0
    ? apiPartners.map((p: any, index: number) => {
        const roleLower = (p.role || p.type || '').toLowerCase();
        const colors = roleColorMap[roleLower] || { roleColor: 'text-slate-500', borderColor: 'border-slate-400' };
        return {
          id: p._id || p.id || index + 1,
          avatar: p.avatar || p.image || fallbackAvatars[index % fallbackAvatars.length],
          name: p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Partenaire',
          role: p.role || p.type || 'Partenaire',
          roleColor: colors.roleColor,
          borderColor: colors.borderColor,
          description: p.description || p.bio || 'Professionnel de l\'immobilier',
          specialty: p.specialty || p.specialite || 'Spécialiste en investissement immobilier',
          location: p.location || p.city || 'Paris',
          phone: p.phone || p.telephone || '+33 00 000 00',
        };
      })
    : fallbackPartners;

  const filters: { key: FilterCategory; label: string; color: string; activeColor: string }[] = [
    { key: "notaire", label: "Notaire", color: "border-slate-300 text-slate-700", activeColor: "bg-[#DBD9D9] text-[#1E1E1E] border-slate-900" },
    { key: "avocats", label: "Avocats", color: "border-red-500 text-red-500", activeColor: "bg-[#DEECFE] text-[#007BFF] border-red-500" },
    { key: "btp", label: "Société BTP", color: "border-red-500 text-red-500", activeColor: "bg-[#FFF8E5] text-[#FFB800] border-red-500" },
    { key: "architectes", label: "Architectes", color: "border-green-500 text-green-500", activeColor: "bg-[#1FAF381C] text-[#1FAF38] border-green-500" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Titre de la page */}
        <h1 className="text-2xl font-bold text-slate-900 text-center">
          Mes partenaires
        </h1>

        {/* Filtres */}
        <div className="flex flex-wrap justify-center gap-2">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`px-5 py-2 rounded-full text-sm font-medium border transition-colors ${
                activeFilter === filter.key
                  ? filter.activeColor
                  : `${filter.color} bg-white hover:bg-slate-50`
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Liste des partenaires */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
            </div>
          ) : partners.map((partner) => (
            <div
              key={partner.id}
              className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100"
            >
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                {/* Avatar avec bordure colorée */}
                <div className={`flex-shrink-0 self-center sm:self-start`}>
                  <div
                    className={`w-20 h-20 rounded-full border-4 ${partner.borderColor} overflow-hidden`}
                  >
                    <img
                      src={partner.avatar}
                      alt={partner.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Contenu principal */}
                <div className="flex-1 min-w-0">
                  {/* Nom et rôle */}
                  <div className="text-center sm:text-left mb-2">
                    <h3 className="font-semibold text-slate-900 text-lg">
                      {partner.name}
                    </h3>
                    <p className={`text-sm ${partner.roleColor}`}>
                      {partner.role}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-500 mb-3 line-clamp-2 text-center sm:text-left">
                    {partner.description}
                  </p>

                  {/* Spécialité et contact */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    {/* Badge spécialité */}
                    <span className="inline-flex self-center sm:self-start px-3 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">
                      {partner.specialty}
                    </span>

                    {/* Localisation */}
                    <div className="flex items-center justify-center sm:justify-start gap-1 text-slate-500">
                      <img src={localisationIcon} alt="Localisation" className="w-4 h-4" />
                      <span className="text-sm">{partner.location}</span>
                    </div>

                    {/* Téléphone */}
                    <div className="flex items-center justify-center sm:justify-start gap-1 text-slate-500">
                      <img src={callIcon} alt="Téléphone" className="w-4 h-4" />
                      <span className="text-sm">{partner.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-center sm:justify-end gap-3 sm:self-center">
                  <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                    <MoreVertical size={20} />
                  </button>
                  <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-full text-sm font-medium transition-colors">
                    Contacter
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Partners;
