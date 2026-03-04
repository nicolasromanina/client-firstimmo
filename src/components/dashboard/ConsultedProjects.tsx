import ProjectCard from "./ProjectCard";
import projectImmeuble from "@/assets/consulted-project-1.png";
import { useConsultedProjects } from "@/hooks/useApi";
import { useNavigate } from "react-router-dom";
import { Search, Loader2 } from "lucide-react";

/**
 * ConsultedProjects Component
 * Section affichant les projets récemment consultés (historique de vues)
 */

const formatTimeAgo = (dateStr: string): string => {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'À l\'instant';
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Hier';
  return `Il y a ${diffDays} jours`;
};

const ConsultedProjects = () => {
  const { data, isLoading } = useConsultedProjects({ limit: 4 });
  const navigate = useNavigate();

  const consultedProjects = data?.consultedProjects || [];
  const hasProjects = consultedProjects.length > 0;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      {/* Titre */}
      <h3 className="text-lg font-semibold text-slate-900 text-center mb-4">
        Projets Consultés
      </h3>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      ) : hasProjects ? (
        <>
          {/* Liste des projets */}
          <div className="divide-y divide-slate-100">
            {consultedProjects.map((item: any) => {
              const project = item.project;
              if (!project) return null;
              const coverImage = project.media?.coverImage
                || project.images?.[0]
                || project.image
                || projectImmeuble;
              return (
                <ProjectCard
                  key={project._id}
                  id={project._id}
                  image={typeof coverImage === 'string' ? coverImage : coverImage?.url || projectImmeuble}
                  title={project.title || project.name || 'Projet'}
                  description={project.shortDescription || project.description || ''}
                  location={project.city || project.location || project.area || ''}
                  priceRange={
                    project.priceFrom
                      ? `À partir de ${project.priceFrom.toLocaleString('fr-FR')} ${project.currency || 'XOF'}`
                      : 'Prix sur demande'
                  }
                  visitDate={formatTimeAgo(item.lastViewedAt)}
                />
              );
            })}
          </div>

          {/* Bouton voir tous les projets */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/projets')}
              className="bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-8 rounded-full transition-colors"
            >
              Voir tous les projets
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
