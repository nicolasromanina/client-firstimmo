import { useState } from "react";
import { Download, Eye, ChevronDown, Loader2, X, FileText, Image, Lock } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import pdfIcon from "@/assets/pdf-icon.svg";
import imageIcon from "@/assets/image-icon.svg";
import { useClientDocuments } from "@/hooks/useApi";
import { request } from "@/lib/client";
import type { ClientDocument } from "@/lib/types";

/**
 * Documents Page - Full Featured Implementation
 * Sorting, pagination, search, preview, download, tags display
 */

interface Document {
  id: number | string;
  type: "pdf" | "image";
  title: string;
  category?: string;
  tags?: string[];
  author: {
    name: string;
  };
  url?: string;
  date: string;
  project: string;
  projectId?: string;
  size?: number;
  visibility?: 'public' | 'private';
}

type FilterCategory = "plans" | "juridique" | "echanges";
type SortOption = "date" | "promoteur" | "projet";
type ClientDocumentView = ClientDocument & {
  id?: string;
  title?: string;
  author?: { name?: string };
  project?: { name?: string };
  size?: number;
};

const Documents = () => {
  // State management
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterCategory | "all">("all");
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [requestingAccess, setRequestingAccess] = useState<string | null>(null);
  const [accessRequested, setAccessRequested] = useState<Set<string>>(new Set());
  const [privateDocModal, setPrivateDocModal] = useState<Document | null>(null);

  const limit = 8;
  const { data: apiResponse, isLoading } = useClientDocuments({
    category: activeFilter === "all" ? undefined : activeFilter,
    sortBy,
    page,
    limit,
    search: searchQuery || undefined,
  });

  const documents: Document[] = (apiResponse?.documents || []).map((doc: ClientDocumentView) => ({
    id: doc._id || doc.id,
    type: doc.type === "image" ? ("image" as const) : ("pdf" as const),
    title: doc.name || doc.title || "Document",
    category: doc.category,
    tags: doc.tags || [],
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
    project: doc.projectName || doc.project?.name || "Projet",
    projectId: doc.projectId,
    size: doc.size,
    visibility: doc.visibility as 'public' | 'private' | undefined,
  }));

  const total = apiResponse?.total || 0;
  const hasMore = apiResponse?.hasMore || false;

  const filters: { key: FilterCategory | "all"; label: string; color: string; activeColor: string }[] = [
    { key: "all", label: "Tous", color: "border-slate-400 text-slate-500", activeColor: "bg-slate-100 text-slate-900" },
    { key: "plans", label: "Plans", color: "border-sky-500 text-sky-500", activeColor: "bg-[#DEECFE] text-[#007BFF]" },
    { key: "juridique", label: "Juridique", color: "border-amber-500 text-amber-500", activeColor: "bg-[#FFF8E5] text-[#FFB800]" },
    { key: "echanges", label: "Échanges", color: "border-green-500 text-green-500", activeColor: "bg-[#1FAF381C] text-[#1FAF38]" },
  ];

  const categoryLabelMap: Record<string, string> = {
    foncier: "Foncier",
    plans: "Plans",
    permis: "Permis",
    contrats: "Contrats",
    financier: "Financier",
    technique: "Technique",
    autre: "Autre",
  };

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setPage((prev) => prev + 1);
    setIsLoadingMore(false);
  };

  const handleDownload = (url: string | undefined, title: string) => {
    if (!url) return;
    const link = document.createElement("a");
    link.href = url;
    link.download = title || "document";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleRequestAccess = async (docId: string | number) => {
    try {
      setRequestingAccess(String(docId));
      await request({
        url: `/api/documents/${docId}/request-access`,
        method: 'post'
      });
      setAccessRequested(prev => new Set([...prev, String(docId)]));
    } catch (error) {
      console.error('Error requesting access:', error);
      alert('Erreur lors de la demande d\'accès');
    } finally {
      setRequestingAccess(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header avec tri et filtres */}
        <div className="space-y-4">
          {/* Search and Sort Row */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Rechercher par nom, projet ou promoteur..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <span className="text-sm text-slate-500 block mb-2">Trier par</span>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-full text-sm font-medium whitespace-nowrap"
              >
                {sortBy === "date" ? "Date" : sortBy === "promoteur" ? "Promoteur" : "Projet"}
                <ChevronDown size={16} />
              </button>
              {isDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-slate-100 py-2 min-w-40 z-10">
                  {[
                    { value: "date" as SortOption, label: "Date (Récent)" },
                    { value: "promoteur" as SortOption, label: "Promoteur" },
                    { value: "projet" as SortOption, label: "Projet" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        setIsDropdownOpen(false);
                        setPage(1);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        sortBy === option.value
                          ? "bg-sky-50 text-sky-700 font-medium"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Filtres par catégorie */}
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.key}
                onClick={() => {
                  setActiveFilter(filter.key);
                  setPage(1);
                  setSearchQuery("");
                }}
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
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">
                {searchQuery || activeFilter !== "all"
                  ? "Aucun document trouvé pour votre recherche."
                  : "Aucun document disponible pour le moment."}
              </p>
              <p className="text-sm text-slate-400 mt-2">
                Favorisez des projets pour voir leurs documents associés.
              </p>
            </div>
          ) : (
            documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 hover:border-slate-200 transition-colors"
              >
                <div className="flex flex-col gap-4">
                  {/* Titre avec icône et catégorie */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 relative ${
                          doc.type === "pdf" ? "bg-red-100" : "bg-sky-100"
                        }`}
                      >
                        {doc.type === "pdf" ? (
                          <img src={pdfIcon} alt="PDF" className="w-5 h-5" />
                        ) : (
                          <img src={imageIcon} alt="Image" className="w-5 h-5" />
                        )}
                        {doc.visibility === 'private' && (
                          <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-1">
                            <Lock size={10} className="text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-900 truncate">{doc.title}</h3>
                          {doc.visibility === 'private' && (
                            <span className="text-amber-600 text-xs font-medium whitespace-nowrap">Sur demande</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{formatFileSize(doc.size)}</p>
                      </div>
                    </div>
                    {doc.category && (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 whitespace-nowrap flex-shrink-0">
                        {categoryLabelMap[doc.category] || doc.category}
                      </span>
                    )}
                  </div>

                  {/* Tags */}
                  {doc.tags && doc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {doc.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Private Document Info Box */}
                  {doc.visibility === 'private' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-3">
                      <Lock size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-amber-900">Document confidentiel</p>
                        <p className="text-xs text-amber-700 mt-0.5">
                          Cliquez sur "Demander l'accès" pour contacter le promoteur
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Infos et actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2 border-t border-slate-100">
                    {/* Auteur */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-semibold text-sm">
                        {doc.author.name?.charAt(0)?.toUpperCase() || "P"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {doc.author.name}
                        </p>
                        <p className="text-xs text-slate-500">{doc.date}</p>
                      </div>
                    </div>

                    {/* Métadonnées */}
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-slate-600 sm:ml-4">
                      <div>
                        <span className="text-slate-400 text-xs uppercase tracking-wide">Projet</span>
                        <p className="text-slate-900 font-medium">{doc.project}</p>
                      </div>
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex items-center gap-2 sm:ml-auto flex-wrap">
                      {doc.visibility === 'private' ? (
                        <>
                          {accessRequested.has(String(doc.id)) ? (
                            <button
                              disabled
                              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium"
                            >
                              ✓ Demande envoyée
                            </button>
                          ) : (
                            <button
                              onClick={() => setPrivateDocModal(doc)}
                              disabled={requestingAccess === String(doc.id)}
                              title="Demander l'accès à ce document"
                              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                            >
                              {requestingAccess === String(doc.id) ? (
                                <>
                                  <Loader2 size={14} className="animate-spin" />
                                  <span className="hidden sm:inline">Demande...</span>
                                </>
                              ) : (
                                <>
                                  <Lock size={14} />
                                  <span className="hidden sm:inline">Demander l'accès</span>
                                </>
                              )}
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          <button
                            disabled={!doc.url}
                            onClick={() => handleDownload(doc.url, doc.title)}
                            title="Télécharger le document"
                            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                          >
                            <Download size={14} />
                            <span className="hidden sm:inline">Télécharger</span>
                          </button>
                          <button
                            disabled={!doc.url}
                            onClick={() => doc.url && setPreviewDoc(doc)}
                            title="Aperçu du document"
                            className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                          >
                            <Eye size={14} />
                            <span className="hidden sm:inline">Aperçu</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Info */}
        {total > 0 && (
          <div className="flex flex-col gap-4 pt-6 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Affichage de <span className="font-medium">{(page - 1) * limit + 1}</span> à{" "}
              <span className="font-medium">{Math.min(page * limit, total)}</span> sur{" "}
              <span className="font-medium">{total}</span> documents
            </p>

            {/* Bouton Voir Plus - centré */}
            {hasMore && (
              <div className="flex justify-center">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-10 py-3 rounded-full font-semibold text-base transition-all hover:shadow-lg disabled:shadow-none"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Chargement...
                    </>
                  ) : (
                    <>
                      Voir Plus
                      <ChevronDown size={20} />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Private Document Access Request Modal */}
      {privateDocModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setPrivateDocModal(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with lock icon */}
            <div className="flex items-center justify-center w-12 h-12 mx-auto mt-6 bg-amber-100 rounded-full">
              <Lock size={24} className="text-amber-600" />
            </div>

            {/* Content */}
            <div className="p-6 text-center">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Document confidentiel
              </h2>
              <p className="text-slate-600 mb-6">
                Ce document n'est accessible que sur demande. Contactez le promoteur pour demander l'accès.
              </p>

              {/* Document info */}
              <div className="bg-slate-50 rounded-lg p-4 mb-6 text-left">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Document</p>
                  <p className="font-medium text-slate-900 truncate">{privateDocModal.title}</p>
                </div>
                <div className="mt-3">
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Projet</p>
                  <p className="font-medium text-slate-900">{privateDocModal.project}</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setPrivateDocModal(null)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-full font-medium transition-colors"
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    setPrivateDocModal(null);
                    handleRequestAccess(privateDocModal.id);
                  }}
                  disabled={accessRequested.has(String(privateDocModal.id)) || requestingAccess === String(privateDocModal.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-full font-medium transition-colors"
                >
                  {requestingAccess === String(privateDocModal.id) ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Demande...
                    </>
                  ) : accessRequested.has(String(privateDocModal.id)) ? (
                    <>
                      ✓ Demande envoyée
                    </>
                  ) : (
                    <>
                      <Lock size={16} />
                      Demander l'accès
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewDoc(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between gap-4 bg-white border-b border-slate-100 p-6">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    previewDoc.type === "pdf" ? "bg-red-100" : "bg-sky-100"
                  }`}
                >
                  {previewDoc.type === "pdf" ? (
                    <img src={pdfIcon} alt="PDF" className="w-5 h-5" />
                  ) : (
                    <img src={imageIcon} alt="Image" className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-slate-900 truncate">{previewDoc.title}</h2>
                  <p className="text-sm text-slate-500">{previewDoc.date}</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="flex-shrink-0 p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {previewDoc.type === "image" && previewDoc.url ? (
                <img
                  src={previewDoc.url}
                  alt={previewDoc.title}
                  className="w-full h-auto rounded-lg"
                />
              ) : previewDoc.type === "pdf" && previewDoc.url ? (
                <div className="bg-slate-100 rounded-lg p-8 text-center">
                  <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 mb-4">
                    L'aperçu PDF n'est pas disponible dans le navigateur.
                  </p>
                  <a
                    href={previewDoc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-6 py-2 rounded-full font-medium transition-colors"
                  >
                    <Eye size={16} />
                    Ouvrir le PDF
                  </a>
                </div>
              ) : (
                <div className="bg-slate-100 rounded-lg p-8 text-center">
                  <p className="text-slate-600">Document non disponible</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="sticky bottom-0 flex items-center gap-3 bg-white border-t border-slate-100 p-6">
              <button
                onClick={() => handleDownload(previewDoc.url, previewDoc.title)}
                className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full font-medium transition-colors"
              >
                <Download size={16} />
                Télécharger
              </button>
              <button
                onClick={() => setPreviewDoc(null)}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-900 px-6 py-3 rounded-full font-medium transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Documents;
