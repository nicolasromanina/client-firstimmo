import ProjectCard from "./ProjectCard";
import projectImmeuble from "@/assets/consulted-project-1.png";
import projectResidence from "@/assets/consulted-project-2.png";
import { useFavorites } from "@/hooks/useApi";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
/**
 * ConsultedProjects Component
 * Section affichant les projets récemment consultés (favoris)
 * Avec bouton pour voir tous les projets
 */

const ConsultedProjects = () => {
  const { data: favorites } = useFavorites();
  const navigate = useNavigate();

  const hasProjects = favorites && favorites.length > 0;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      {/* Titre */}
      <h3 className="text-lg font-semibold text-slate-900 text-center mb-4">
        Projets Consultés
      </h3>

      {hasProjects ? (
        <>
          {/* Liste des projets */}
          <div className="divide-y divide-slate-100">
            {favorites?.slice(0, 4).map((fav: any) => (
              <ProjectCard
                key={fav._id || fav.id}
                id={fav._id || fav.id}
                image={fav.project?.images?.[0] || fav.project?.image || projectImmeuble}
                title={fav.project?.name || fav.project?.title || 'Projet'}
                description={fav.project?.description || 'Description du projet'}
                location={fav.project?.location || fav.project?.city || 'Localisation'}
                priceRange={fav.project?.priceRange || 'Prix sur demande'}
                visitDate={
                  fav.createdAt
                    ? `Consulté il y a ${Math.max(1, Math.floor((Date.now() - new Date(fav.createdAt).getTime()) / 86400000))} jours`
                    : 'Consulté récemment'
                }
              />
            ))}
          </div>

          {/* Bouton voir tous les projets */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/projets')}
              className="bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-8 rounded-full transition-colors"
            >
              Voir tous les projets consultés
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 font-medium mb-2">
            Vous n'avez encore consulté aucun projet
          </p>
          <p className="text-slate-400 text-sm mb-6">
            Explorez nos projets pour commencer vos recherches
          </p>
          <button
            onClick={() => navigate('/projets')}
            className="bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-8 rounded-full transition-colors inline-block"
          >
            Découvrir les projets
          </button>
        </div>
      )}
    </div>
  );
};

export default ConsultedProjects;
