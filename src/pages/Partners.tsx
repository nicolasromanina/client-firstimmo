import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import partnerMarie1 from "@/assets/partner-marie-1.jpg";
import partnerMarie2 from "@/assets/partner-marie-2.jpg";
import partnerMarie3 from "@/assets/partner-marie-3.jpg";
import localisationIcon from "@/assets/localisation-icon.svg";
import { useCreatePartnerContactRequest, usePartners } from "@/hooks/useApi";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

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
  const [contactTarget, setContactTarget] = useState<PartnerCard | null>(null);
  const [isCreatingRequestFor, setIsCreatingRequestFor] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    fullName: "",
    email: "",
    phone: "",
    message: "",
  });
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

  const handleOpenContactForm = (partner: PartnerCard) => {
    setContactTarget(partner);
  };

  const handleSubmitContact = async () => {
    if (!contactTarget) return;
    if (!formState.fullName.trim() || !formState.email.trim() || !formState.message.trim()) {
      toast({
        title: "Champs obligatoires",
        description: "Nom, email et message sont requis.",
        variant: "destructive",
      });
      return;
    }
    setIsCreatingRequestFor(contactTarget.id);
    try {
      await createContactRequest.mutateAsync({
        type: contactTarget.backendType || "autre",
        preferredPartnerId: contactTarget.id,
        description: formState.message,
        metadata: {
          contact: {
            fullName: formState.fullName,
            email: formState.email,
            phone: formState.phone,
          },
          partnerName: contactTarget.name,
          source: "client-dashboard",
        },
      });
      toast({
        title: "Demande envoyee",
        description: "Votre demande a ete envoyee.",
      });
      setContactTarget(null);
      setFormState({ fullName: "", email: "", phone: "", message: "" });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error?.message || "Impossible d'envoyer la demande de contact.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingRequestFor(null);
    }
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
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-3 sm:self-center">
                      <button
                        onClick={() => handleOpenContactForm(partner)}
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

      <Dialog
        open={!!contactTarget}
        onOpenChange={(open) => {
          if (!open) setContactTarget(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Contacter le partenaire</DialogTitle>
            <DialogDescription>
              Envoyez une demande a <strong>{contactTarget?.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 pt-2">
            <div className="grid gap-2">
              <Label htmlFor="partner-full-name">Nom complet</Label>
              <Input
                id="partner-full-name"
                value={formState.fullName}
                onChange={(event) => setFormState((prev) => ({ ...prev, fullName: event.target.value }))}
                placeholder="Votre nom"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="partner-email">Email</Label>
              <Input
                id="partner-email"
                type="email"
                value={formState.email}
                onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="Votre email"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="partner-phone">Telephone (optionnel)</Label>
              <Input
                id="partner-phone"
                value={formState.phone}
                onChange={(event) => setFormState((prev) => ({ ...prev, phone: event.target.value }))}
                placeholder="Votre telephone"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="partner-message">Message</Label>
              <Textarea
                id="partner-message"
                value={formState.message}
                onChange={(event) => setFormState((prev) => ({ ...prev, message: event.target.value }))}
                placeholder="Decrivez votre besoin"
                rows={4}
              />
            </div>
            <Button onClick={handleSubmitContact} disabled={isCreatingRequestFor === contactTarget?.id}>
              {isCreatingRequestFor === contactTarget?.id ? "Envoi..." : "Envoyer la demande"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Partners;
