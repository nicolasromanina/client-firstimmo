import { MapPin } from "lucide-react";
import localisatisationIcon from "@/assets/localisation-icon.svg";

/**
 * ProjectCard Component
 * Carte affichant un projet immobilier consulté
 * Avec image, titre, description, localisation et date de visite
 */

interface ProjectCardProps {
  image: string;
  title: string;
  description: string;
  location: string;
  priceRange: string;
  visitDate: string;
}

const ProjectCard = ({
  image,
  title,
  description,
  location,
  priceRange,
  visitDate,
}: ProjectCardProps) => {
  return (
    <div className="flex gap-4 py-4 border-b border-slate-100 last:border-b-0">
      {/* Image du projet */}
      <img
        src={image}
        alt={title}
        className="w-28 h-20 sm:w-32 sm:h-24 rounded-lg object-cover flex-shrink-0"
      />

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
          <h4 className="font-semibold text-slate-900 text-sm sm:text-base">{title}</h4>
          <span className="text-sm text-slate-500 whitespace-nowrap">{priceRange}</span>
        </div>

        <p className="text-xs sm:text-sm text-slate-500 mt-1 line-clamp-2">
          {description}
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2 gap-2">
          {/* Localisation */}
          <div className="flex items-center gap-1 text-slate-500">
            <img src={localisatisationIcon} alt="Localisation" className="w-3 h-3" />
            <span className="text-xs">{location}</span>
          </div>

          {/* Badge date de visite */}
          <span className="inline-flex self-start sm:self-auto px-3 py-1 bg-slate-900 text-white text-xs rounded-full">
            {visitDate}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
