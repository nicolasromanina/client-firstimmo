import ProjectCard from "./ProjectCard";
import projectImmeuble from "@/assets/project-immeuble.jpg";
import projectResidence from "@/assets/project-residence.jpg";

/**
 * ConsultedProjects Component
 * Section affichant les projets récemment consultés
 * Avec bouton pour voir tous les projets
 */

const projects = [
  {
    id: 1,
    image: projectImmeuble,
    title: "Immeuble Lorem Horizon",
    description:
      "Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos",
    location: "Proche centre ville Haute standing",
    priceRange: "110 000 € à 110 000 €",
    visitDate: "Visité il y a une semaine",
  },
  {
    id: 2,
    image: projectResidence,
    title: "Résidence lorem",
    description:
      "Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos",
    location: "7mn de la Plage St Lorem",
    priceRange: "70 000 € à 100 000 €",
    visitDate: "Visité il y a une semaine",
  },
];

const ConsultedProjects = () => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      {/* Titre */}
      <h3 className="text-lg font-semibold text-slate-900 text-center mb-4">
        Projets Consultés
      </h3>

      {/* Liste des projets */}
      <div className="divide-y divide-slate-100">
        {projects.map((project) => (
          <ProjectCard key={project.id} {...project} />
        ))}
      </div>

      {/* Bouton voir tous les projets */}
      <div className="mt-6 text-center">
        <button className="bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-8 rounded-full transition-colors">
          Voir les projets Consultés
        </button>
      </div>
    </div>
  );
};

export default ConsultedProjects;
