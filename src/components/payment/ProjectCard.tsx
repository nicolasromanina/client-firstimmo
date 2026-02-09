import { ArrowUpRight } from "lucide-react";

/**
 * Interface définissant les propriétés d'une carte de projet
 */
interface ProjectCardProps {
  title: string;
  description: string;
  status: string;
  deliveryDate: string;
  imageUrl: string;
}

/**
 * Composant ProjectCard - Carte de projet avec fond sombre
 * Affiche les informations du projet avec image et statut
 */
const ProjectCard = ({
  title,
  description,
  status,
  deliveryDate,
  imageUrl,
}: ProjectCardProps) => {
  return (
    <div className="bg-gray-900 rounded-2xl p-4 sm:p-5 flex gap-4 relative overflow-hidden">
      {/* Contenu textuel à gauche */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        {/* Titre du projet */}
        <h3 className="text-white font-semibold text-base sm:text-lg leading-tight mb-2">
          {title}
        </h3>
        
        {/* Description */}
        <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-4">
          {description}
        </p>
        
        {/* Statut */}
        <div className="mb-3">
          <span className="text-gray-400 text-xs sm:text-sm">Statut : </span>
          <span className="text-green-500 text-xs sm:text-sm font-medium">{status}</span>
        </div>
        
        {/* Badge de livraison */}
        <div className="inline-flex">
          <span className="bg-white text-gray-900 text-xs font-medium px-3 py-1.5 rounded-full">
            {deliveryDate}
          </span>
        </div>
      </div>
      
      {/* Image du projet à droite */}
      <div className="w-28 sm:w-36 h-24 sm:h-28 flex-shrink-0 rounded-lg overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Bouton flèche en bas à droite */}
      <button className="absolute bottom-4 right-4 w-8 h-8 sm:w-9 sm:h-9 bg-coral-500 hover:bg-coral-600 rounded-full flex items-center justify-center transition-colors duration-200">
        <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
      </button>
    </div>
  );
};

export default ProjectCard;
