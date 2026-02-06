import { FileText, Image } from "lucide-react";

/**
 * DocumentsCard Component
 * Carte affichant les documents récents de l'utilisateur
 * Avec lien vers la liste complète
 */

interface Document {
  id: number;
  name: string;
  type: "pdf" | "image";
  date: string;
}

const documents: Document[] = [
  { id: 1, name: "Document Villa Lorem Horizon", type: "pdf", date: "Il y a 1 jours" },
  { id: 2, name: "Plan Résidence B", type: "image", date: "Il y a 3 jours" },
  { id: 3, name: "Document Résidence B", type: "image", date: "Il y a 4 jours" },
];

const DocumentsCard = () => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      {/* Titre */}
      <h3 className="text-lg font-semibold text-slate-900 text-center mb-6">
        Mes documents
      </h3>

      {/* Liste des documents */}
      <div className="space-y-4 mb-6">
        {documents.map((doc) => (
          <div key={doc.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Icône du type de document */}
              <div
                className={`w-6 h-6 rounded flex items-center justify-center ${
                  doc.type === "pdf" ? "bg-red-100" : "bg-amber-100"
                }`}
              >
                {doc.type === "pdf" ? (
                  <FileText size={14} className="text-red-500" />
                ) : (
                  <Image size={14} className="text-amber-600" />
                )}
              </div>
              <span className="text-sm text-slate-700">{doc.name}</span>
            </div>
            <span className="text-xs text-slate-400 italic whitespace-nowrap ml-2">
              {doc.date}
            </span>
          </div>
        ))}
      </div>

      {/* Bouton voir tous les documents */}
      <button className="w-full bg-sky-500 hover:bg-sky-600 text-white font-medium py-3 px-6 rounded-full transition-colors">
        Voir tout mes documents
      </button>
    </div>
  );
};

export default DocumentsCard;
