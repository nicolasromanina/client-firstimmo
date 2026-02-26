import pdfIcon from "@/assets/pdf-icon.svg";
import imageIcon from "@/assets/image-icon.svg";
import docIcon from "@/assets/doc-icon.svg";
import { useClientDocuments } from "@/hooks/useApi";
import { useNavigate } from "react-router-dom";
import type { ClientDocument } from "@/lib/types";
/**
 * DocumentsCard Component
 * Carte affichant les documents récents de l'utilisateur
 * Avec lien vers la liste complète
 */

interface Document {
  id: number | string;
  name: string;
  type: "pdf" | "image" | "doc";
  date: string;
}
type ClientDocumentView = ClientDocument & {
  id?: string;
  title?: string;
};

const DocumentsCard = () => {
  const { data: apiDocs } = useClientDocuments();
  const navigate = useNavigate();

  const documents: Document[] = (apiDocs || []).slice(0, 3).map((doc: ClientDocumentView, index: number) => ({
    id: doc._id || doc.id || index + 1,
    name: doc.name || doc.title || "Document",
    type: (doc.type === "image" ? "image" : doc.type === "doc" ? "doc" : "pdf") as
      | "pdf"
      | "image"
      | "doc",
    date: doc.createdAt
      ? `Il y a ${Math.max(1, Math.floor((Date.now() - new Date(doc.createdAt).getTime()) / 86400000))} jours`
      : "Récent",
  }));

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      {/* Titre */}
      <h3 className="text-lg font-semibold text-slate-900 text-center mb-6">
        Mes documents
      </h3>

      {/* Liste des documents */}
      {documents.length === 0 ? (
        <div className="mb-6 rounded-xl border border-slate-100 bg-slate-50 p-4 text-center text-sm text-slate-500">
          Aucun document disponible.
        </div>
      ) : (
        <div className="space-y-4 mb-6">
          {documents.map((d) => (
            <div key={d.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Icône du type de document */}
                <div
                  className={`w-6 h-6 rounded flex items-center justify-center ${
                    d.type === "pdf" ? "bg-red-100" : "bg-amber-100"
                  }`}
                >
                  {d.type === "pdf" ? (
                    <img src={pdfIcon} alt="PDF" className="w-4 h-4" />
                  ) : d.type === "image" ? (
                    <img src={imageIcon} alt="Image" className="w-4 h-4" />
                  ) : (
                    <img src={docIcon} alt="Document" className="w-4 h-4" />
                  )}
                </div>
                <span className="text-sm text-slate-700">{d.name}</span>
              </div>
              <span className="text-xs text-slate-400 italic whitespace-nowrap ml-2">
                {d.date}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Bouton voir tous les documents */}
      <button
        onClick={() => navigate('/documents')}
        className="w-full bg-sky-500 hover:bg-sky-600 text-white font-medium py-3 px-6 rounded-full transition-colors"
      >
        Voir tout mes documents
      </button>
    </div>
  );
};

export default DocumentsCard;
