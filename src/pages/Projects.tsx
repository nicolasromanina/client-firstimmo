import { useState } from "react";
import { MapPin, Eye, ChevronDown } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import projectImmeuble from "@/assets/project-immeuble.jpg";
import projectResidence from "@/assets/project-residence.jpg";

/**
 * Projects Page (Mes projets)
 * Liste des projets immobiliers avec tri et filtres
 */

interface Project {
  id: number;
  image: string;
  title: string;
  description: string;
  location: string;
  priceRange: string;
  visitBadge: string;
}

const projects: Project[] = [
  {
    id: 1,
    image: projectImmeuble,
    title: "Immeuble Lorem Horizon",
    description:
      "Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos",
    location: "Proche centre ville Haute standing",
    priceRange: "40 000 € à 170 000 €",
    visitBadge: "Visité il y a une semaine",
  },
  {
    id: 2,
    image: projectResidence,
    title: "Residence B",
    description:
      "Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos",
    location: "Proche centre ville Haute standing",
    priceRange: "70 000 € à 200 000 €",
    visitBadge: "Visité il y a une semaine",
  },
  {
    id: 3,
    image: projectImmeuble,
    title: "Immeuble Libero",
    description:
      "Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos",
    location: "Proche centre ville Haute standing",
    priceRange: "30 000 € à 150 000 €",
    visitBadge: "Visité il y a une semaine",
  },
];

const Projects = () => {
  const [sortBy, setSortBy] = useState("Date");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Titre de la page */}
        <h1 className="text-2xl font-bold text-slate-900 text-center">
          Liste des projets
        </h1>

        {/* Dropdown de tri */}
        <div className="relative inline-block">
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
              {["Date", "Prix", "Nom"].map((option) => (
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

        {/* Liste des projets */}
        <div className="space-y-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100"
            >
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                {/* Image du projet */}
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full sm:w-40 h-32 sm:h-28 rounded-xl object-cover flex-shrink-0"
                />

                {/* Contenu principal */}
                <div className="flex-1 min-w-0">
                  {/* Titre et prix */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-2">
                    <h3 className="font-semibold text-slate-900 text-base">
                      {project.title}
                    </h3>
                    <span className="text-sm text-slate-500 whitespace-nowrap">
                      {project.priceRange}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-500 mb-3 line-clamp-2">
                    {project.description}
                  </p>

                  {/* Localisation et badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
                    <div className="flex items-center gap-1 text-slate-500">
                      <MapPin size={14} />
                      <span className="text-xs">{project.location}</span>
                    </div>
                    <span className="inline-flex self-start px-3 py-1 bg-slate-900 text-white text-xs rounded-full">
                      {project.visitBadge}
                    </span>
                  </div>
                </div>

                {/* Bouton Aperçu */}
                <div className="flex items-center sm:self-center">
                  <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-6 py-2.5 rounded-full text-sm font-medium transition-colors">
                    <Eye size={16} />
                    Aperçu
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bouton Afficher plus */}
        <div className="text-center pt-4">
          <button className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-full font-medium transition-colors">
            Afficher plus de projet
            <ChevronDown size={18} />
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Projects;
