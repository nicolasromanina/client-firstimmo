import { useMemo, useState } from "react";
import { MoreVertical, Loader2, Mail, Globe, PhoneCall } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import partnerMarie1 from "@/assets/partner-marie-1.jpg";
import partnerMarie2 from "@/assets/partner-marie-2.jpg";
import partnerMarie3 from "@/assets/partner-marie-3.jpg";
import localisationIcon from "@/assets/localisation-icon.svg";
import callIcon from "@/assets/call.svg";
import { useCreatePartnerContactRequest, usePartners } from "@/hooks/useApi";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PartnerCard {
  id: string;
  avatar: string;
  name: string;
  type: string;
  roleColor: string;
  borderColor: string;
  description: string;
  location: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  backendType: string;
}

const fallbackAvatars = [partnerMarie1, partnerMarie2, partnerMarie3];

const roleColorMap: Record<string, { roleColor: string; borderColor: string; label: string }> = {
  notaire: { roleColor: "text-slate-600", borderColor: "border-slate-400", label: "Notaire" },
  architecte: { roleColor: "text-sky-600", borderColor: "border-sky-400", label: "Architecte" },
  courtier: { roleColor: "text-emerald-600", borderColor: "border-emerald-400", label: "Courtier" },
  banque: { roleColor: "text-indigo-600", borderColor: "border-indigo-400", label: "Banque" },
  assurance: { roleColor: "text-amber-600", borderColor: "border-amber-400", label: "Assurance" },
  inspection: { roleColor: "text-orange-600", borderColor: "border-orange-400", label: "Inspection / BTP" },
  autre: { roleColor: "text-gray-600", borderColor: "border-gray-400", label: "Premium" },
};

type FilterCategory = "all" | "notaire" | "architecte" | "courtier" | "banque" | "assurance" | "inspection";

const filterTypeMap: Record<FilterCategory, string | undefined> = {
  all: undefined,
  notaire: "notaire",
  architecte: "architecte",
  courtier: "courtier",
  banque: "banque",
  assurance: "assurance",
  inspection: "inspection",
};

const Partners = () => {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");
  const [openedPartnerId, setOpenedPartnerId] = useState<string | null>(null);
  const [contactTarget, setContactTarget] = useState<PartnerCard | null>(null);
  const [isCreatingRequestFor, setIsCreatingRequestFor] = useState<string | null>(null);
  const { toast } = useToast();

  const partnerType = filterTypeMap[activeFilter];
  const { data: apiPartners, isLoading } = usePartners(partnerType ? { type: partnerType } : undefined);
  const createContactRequest = useCreatePartnerContactRequest();

  const partners: PartnerCard[] = useMemo(() => {
    const list = Array.isArray(apiPartners) ? apiPartners : [];
    return list.map((p: any, index: number) => {
      const backendType = String(p.type || "autre").toLowerCase();
      const colors = roleColorMap[backendType] || roleColorMap.autre;
      const cityFromArray = Array.isArray(p.cities) && p.cities.length > 0 ? p.cities[0] : "";
      const countryFromArray = Array.isArray(p.countries) && p.countries.length > 0 ? p.countries[0] : "";
      const location = [cityFromArray, countryFromArray].filter(Boolean).join(", ") || p.location || "Non renseigne";

      return {
        id: p._id || p.id || String(index + 1),
        avatar: p.logo || p.avatar || fallbackAvatars[index % fallbackAvatars.length],
        name: p.name || "Premium",
        type: colors.label,
        roleColor: colors.roleColor,
        borderColor: colors.borderColor,
        description: p.description || p.bio || "Professionnel partenaire",
        location,
        phone: p.phone,
        email: p.email,
        website: p.website,
        address: p.address,
        backendType,
      };
    });
  }, [apiPartners]);

  const handleContact = async (partner: PartnerCard) => {
    setIsCreatingRequestFor(partner.id);
    try {
      await createContactRequest.mutateAsync({
        type: partner.backendType || "autre",
        preferredPartnerId: partner.id,
        description: `Demande de contact envoyee depuis /partenaires pour ${partner.name}`,
      });
      toast({
        title: "Demande enregistree",
        description: "Votre demande a ete envoyee. Choisissez maintenant un canal de contact.",
      });
      if (!partner.phone && !partner.email && !partner.website) {
        toast({
          title: "Contact indisponible",
          description: "Ce partenaire n'a pas encore de canal de contact configure.",
          variant: "destructive",
        });
        return;
      }
      setContactTarget(partner);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error?.message || "Impossible d'envoyer la demande de contact.",
        variant: "destructive",
      });
      return;
    } finally {
      setIsCreatingRequestFor(null);
    }
  };

  const openContactChannel = (channel: "phone" | "email" | "website") => {
    if (!contactTarget) return;
    if (channel === "phone" && contactTarget.phone) {
      window.open(`tel:${contactTarget.phone}`, "_self");
    } else if (channel === "email" && contactTarget.email) {
      window.open(
        `mailto:${contactTarget.email}?subject=Demande%20de%20contact%20First%20Immo`,
        "_self"
      );
    } else if (channel === "website" && contactTarget.website) {
      window.open(contactTarget.website, "_blank", "noopener,noreferrer");
    }
    setContactTarget(null);
  };

  const filters: { key: FilterCategory; label: string; color: string; activeColor: string }[] = [
    { key: "all", label: "Tous", color: "border-slate-300 text-slate-700", activeColor: "bg-slate-900 text-white border-slate-900" },
    { key: "notaire", label: "Notaires", color: "border-slate-300 text-slate-700", activeColor: "bg-[#DBD9D9] text-[#1E1E1E] border-slate-900" },
    { key: "architecte", label: "Architectes", color: "border-green-500 text-green-500", activeColor: "bg-[#1FAF381C] text-[#1FAF38] border-green-500" },
    { key: "courtier", label: "Courtiers", color: "border-sky-500 text-sky-500", activeColor: "bg-[#DEECFE] text-[#007BFF] border-sky-500" },
    { key: "banque", label: "Banques", color: "border-indigo-500 text-indigo-500", activeColor: "bg-indigo-100 text-indigo-700 border-indigo-500" },
    { key: "assurance", label: "Assurances", color: "border-amber-500 text-amber-500", activeColor: "bg-[#FFF8E5] text-[#FFB800] border-amber-500" },
    { key: "inspection", label: "Inspection / BTP", color: "border-orange-500 text-orange-500", activeColor: "bg-orange-100 text-orange-700 border-orange-500" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-center text-2xl font-bold text-slate-900">Mes partenaires</h1>

        <div className="flex flex-wrap justify-center gap-2">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`rounded-full border px-5 py-2 text-sm font-medium transition-colors ${
                activeFilter === filter.key ? filter.activeColor : `${filter.color} bg-white hover:bg-slate-50`
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
            </div>
          ) : partners.length === 0 ? (
            <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center text-slate-500">
              Aucun partenaire disponible pour ce filtre.
            </div>
          ) : (
            partners.map((partner) => {
              const isOpened = openedPartnerId === partner.id;
              return (
                <div key={partner.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
                    <div className="self-center sm:self-start">
                      <div className={`h-20 w-20 overflow-hidden rounded-full border-4 ${partner.borderColor}`}>
                        <img src={partner.avatar} alt={partner.name} className="h-full w-full object-cover" />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-2 text-center sm:text-left">
                        <h3 className="text-lg font-semibold text-slate-900">{partner.name}</h3>
                        <p className={`text-sm ${partner.roleColor}`}>{partner.type}</p>
                      </div>

                      <p className="mb-3 line-clamp-2 text-center text-sm text-slate-500 sm:text-left">{partner.description}</p>

                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                        <div className="flex items-center justify-center gap-1 text-slate-500 sm:justify-start">
                          <img src={localisationIcon} alt="Localisation" className="h-4 w-4" />
                          <span className="text-sm">{partner.location}</span>
                        </div>
                        {partner.phone && (
                          <div className="flex items-center justify-center gap-1 text-slate-500 sm:justify-start">
                            <img src={callIcon} alt="Telephone" className="h-4 w-4" />
                            <span className="text-sm">{partner.phone}</span>
                          </div>
                        )}
                      </div>

                      {isOpened && (
                        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                          <div className="flex flex-wrap items-center gap-3">
                            {partner.email ? (
                              <a href={`mailto:${partner.email}`} className="inline-flex items-center gap-1 text-sky-700 hover:underline">
                                <Mail className="h-4 w-4" /> {partner.email}
                              </a>
                            ) : null}
                            {partner.website ? (
                              <a href={partner.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sky-700 hover:underline">
                                <Globe className="h-4 w-4" /> Site web
                              </a>
                            ) : null}
                            {partner.phone ? (
                              <a href={`tel:${partner.phone}`} className="inline-flex items-center gap-1 text-sky-700 hover:underline">
                                <PhoneCall className="h-4 w-4" /> Appeler
                              </a>
                            ) : null}
                          </div>
                          {partner.address ? <p className="mt-2 text-slate-600">Adresse: {partner.address}</p> : null}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-center gap-3 sm:self-center">
                      <button
                        onClick={() => setOpenedPartnerId(isOpened ? null : partner.id)}
                        className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                        title="Voir la fiche contact"
                      >
                        <MoreVertical size={20} />
                      </button>
                      <button
                        onClick={() => handleContact(partner)}
                        disabled={isCreatingRequestFor === partner.id}
                        className="rounded-full bg-red-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600"
                      >
                        {isCreatingRequestFor === partner.id ? "Envoi..." : "Contacter"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <Dialog open={!!contactTarget} onOpenChange={(open) => !open && setContactTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Choisissez un canal de contact</DialogTitle>
            <DialogDescription>
              Demande envoyee pour <strong>{contactTarget?.name}</strong>. Selectionnez le canal a utiliser.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 pt-2">
            {contactTarget?.phone ? (
              <button
                onClick={() => openContactChannel("phone")}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left hover:bg-slate-50"
              >
                <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-900">
                  <PhoneCall className="h-4 w-4 text-sky-600" />
                  Appeler
                </span>
                <p className="mt-1 text-xs text-slate-500">{contactTarget.phone}</p>
              </button>
            ) : null}

            {contactTarget?.email ? (
              <button
                onClick={() => openContactChannel("email")}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left hover:bg-slate-50"
              >
                <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-900">
                  <Mail className="h-4 w-4 text-sky-600" />
                  Envoyer un email
                </span>
                <p className="mt-1 text-xs text-slate-500">{contactTarget.email}</p>
              </button>
            ) : null}

            {contactTarget?.website ? (
              <button
                onClick={() => openContactChannel("website")}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left hover:bg-slate-50"
              >
                <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-900">
                  <Globe className="h-4 w-4 text-sky-600" />
                  Ouvrir le site
                </span>
                <p className="mt-1 text-xs text-slate-500 line-clamp-1">{contactTarget.website}</p>
              </button>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Partners;
