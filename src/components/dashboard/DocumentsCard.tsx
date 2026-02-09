import pdfIcon from "@/assets/pdf-icon.svg";
import imageIcon from "@/assets/image-icon.svg";
import docIcon from "@/assets/doc-icon.svg";
import { useClientDocuments } from "@/hooks/useApi";
import { useNavigate } from "react-router-dom";
/**
 * DocumentsCard Component
 * Carte affichant les documents récents de l'utilisateur
 * Avec lien vers la liste complète
 */

interface Document {
  id: number;
  name: string;
  type: "pdf" | "image" | "doc";
  date: string;
}

const fallbackDocuments: Document[] = [
  { id: 1, name: "Document Villa Lorem Horizon", type: "pdf", date: "Il y a 1 jours" },
  { id: 2, name: "Plan Résidence B", type: "image", date: "Il y a 3 jours" },
  { id: 3, name: "Document Résidence B", type: "image", date: "Il y a 4 jours" },
];

const DocumentsCard = () => {
  const { data: apiDocs } = useClientDocuments();
  const navigate = useNavigate();

  const documents: Document[] = apiDocs && apiDocs.length > 0
    ? apiDocs.slice(0, 3).map((doc: any, index: number) => ({
        id: doc._id || doc.id || index + 1,
        name: doc.name || doc.title || 'Document',
        type: (doc.type === 'image' ? 'image' : doc.type === 'doc' ? 'doc' : 'pdf') as "pdf" | "image" | "doc",
        date: doc.createdAt
          ? `Il y a ${Math.max(1, Math.floor((Date.now() - new Date(doc.createdAt).getTime()) / 86400000))} jours`
          : 'Récent',
      }))
    : fallbackDocuments;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      {/* Titre */}
      <h3 className="text-lg font-semibold text-slate-900 text-center mb-6">
        Mes documents
      </h3>

      {/* Liste des documents */}
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
