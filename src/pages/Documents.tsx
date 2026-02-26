import { useState } from "react";
import { Download, Eye, ChevronDown, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import pdfIcon from "@/assets/pdf-icon.svg";
import imageIcon from "@/assets/image-icon.svg";
import { useClientDocuments } from "@/hooks/useApi";
import type { ClientDocument } from "@/lib/types";
/**
 * Documents Page
 * Liste des documents avec filtres par catégorie
 */

interface Document {
  id: number | string;
  type: "pdf" | "image";
  title: string;
  author: {
    name: string;
  };
  url?: string;
  date: string;
  project: string;
  value: string;
}

type FilterCategory = "plans" | "juridique" | "echanges";
type ClientDocumentView = ClientDocument & {
  id?: string;
  title?: string;
  author?: { name?: string };
  project?: { name?: string };
};

const Documents = () => {
  const [sortBy, setSortBy] = useState("Promoteur");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("plans");
  const { data: apiDocs, isLoading } = useClientDocuments({ category: activeFilter });

  const documents: Document[] = (apiDocs || []).map((doc: ClientDocumentView) => ({
    id: doc._id || doc.id,
    type: doc.type === "image" ? ("image" as const) : ("pdf" as const),
    title: doc.name || doc.title || "Document",
    author: {
      name: doc.promoteurName || doc.author?.name || "Promoteur",
    },
    url: doc.url,
    date: doc.createdAt
      ? new Date(doc.createdAt).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "Date inconnue",
    project: doc.project?.name || doc.projectName || "Projet",
    value: doc.value || "N/A",
  }));

  const filters: { key: FilterCategory; label: string; color: string; activeColor: string }[] = [
    { key: "plans", label: "Plans", color: "border-sky-500 text-sky-500", activeColor: "bg-[#DEECFE] text-[#007BFF]" },
    { key: "juridique", label: "Juridique", color: "border-amber-500 text-amber-500", activeColor: "bg-[#FFF8E5] text-[#FFB800]" },
    { key: "echanges", label: "Échanges", color: "border-green-500 text-green-500", activeColor: "bg-[#1FAF381C] text-[#1FAF38]" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header avec tri et filtres */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          {/* Dropdown de tri */}
          <div className="relative">
            <span className="text-sm text-slate-500 block mb-2">Trier par</span>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-full text-sm font-medium"
            >
              {sortBy}
              <ChevronDown size={16} />
            </button>
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-slate-100 py-2 min-w-32 z-10">
                {["Promoteur", "Date", "Projet"].map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setSortBy(option);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filtres par catégorie */}
          <div className="flex flex-wrap gap-2">
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
        </div>

        {/* Liste des documents */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
            </div>
          ) : documents.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 text-slate-500">
              Aucun document disponible pour le moment.
            </div>
          ) : (
            documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100"
              >
                <div className="flex flex-col gap-4">
                  {/* Titre avec icône */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded flex items-center justify-center ${
                        doc.type === "pdf" ? "bg-red-100" : "bg-sky-100"
                      }`}
                    >
                      {doc.type === "pdf" ? (
                        <img src={pdfIcon} alt="PDF" className="w-4 h-4" />
                      ) : (
                        <img src={imageIcon} alt="Image" className="w-4 h-4" />
                      )}
                    </div>
                    <h3 className="font-semibold text-slate-900">{doc.title}</h3>
                  </div>

                  {/* Infos et actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Auteur */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-semibold">
                        {doc.author.name?.charAt(0)?.toUpperCase() || "P"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {doc.author.name}
                        </p>
                        <p className="text-xs text-sky-500">{doc.date}</p>
                      </div>
                    </div>

                    {/* Métadonnées */}
                    <div className="flex flex-wrap items-center gap-4 sm:gap-8 text-sm text-slate-500 sm:ml-4">
                      <div>
                        <span className="text-slate-400">Projet :</span>{" "}
                        <span className="text-slate-700">{doc.project}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Valeur:</span>{" "}
                        <span className="text-slate-700">{doc.value}</span>
                      </div>
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex items-center gap-2 sm:ml-auto">
                      <button
                        disabled={!doc.url}
                        onClick={() => doc.url && window.open(doc.url, "_blank", "noopener,noreferrer")}
                        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-slate-300 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                      >
                        <Download size={14} />
                        Télécharger
                      </button>
                      <button
                        disabled={!doc.url}
                        onClick={() => doc.url && window.open(doc.url, "_blank", "noopener,noreferrer")}
                        className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                      >
                        <Eye size={14} />
                        Aperçu
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bouton Afficher plus */}
        <div className="text-center pt-4">
          <button className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-full font-medium transition-colors">
            Afficher plus de documents
            <ChevronDown size={18} />
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Documents;
