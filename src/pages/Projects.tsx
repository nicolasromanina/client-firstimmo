import { useState } from "react";
import { MapPin, Eye, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import projectImmeuble from "@/assets/projet-1.png";
import projectResidence from "@/assets/projet-2.png";
import projet3 from "@/assets/projet-3.png";
import localisatisationIcon from "@/assets/localisation-icon.svg";
import { useSearchProjects } from "@/hooks/useApi";
import { ProjectSearchFilters } from "@/components/projects/ProjectSearchFilters";
import type { ProjectSearchParams } from "@/lib/services";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/currency";

const fallbackImages = [projectImmeuble, projectResidence, projet3];

function ProjectCard({
  project,
  showTrustScore,
}: {
  project: any;
  showTrustScore?: boolean;
}) {
  const image =
    project.media?.coverImage ||
    project.coverImage ||
    project.images?.[0] ||
    project.image ||
    fallbackImages[Math.abs((project.title || project._id || "").length) % 3];
  const title = project.title || project.name || "Projet";
  const location = project.area || project.city || project.location?.city || project.location || "—";
  const priceFrom = project.priceFrom ?? project.priceRange?.min ?? project.price;
  const priceFormatted = formatPrice(priceFrom, project.currency);
  const trustScore = project.trustScore ?? 0;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        <img
          src={typeof image === "string" ? image : (image as any)?.url ?? ""}
          alt={title}
          className="w-full sm:w-40 h-32 sm:h-28 rounded-xl object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-2">
            <h3 className="font-semibold text-slate-900 text-base">{title}</h3>
            <span className="text-sm text-slate-500 whitespace-nowrap">{priceFormatted.display}</span>
          </div>
          <p className="text-sm text-slate-500 mb-3 line-clamp-2">
            {project.description || "Description du projet immobilier"}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-slate-500">
              <img src={localisatisationIcon} alt="" className="w-4 h-4" />
              <span className="text-xs">{location}</span>
            </div>
            {showTrustScore && (
              <Badge variant="secondary" className="text-xs">
                <ShieldCheck className="w-3 h-3 mr-1" />
                Score {trustScore}/100
              </Badge>
            )}
            {project.projectType && (
              <Badge variant="outline" className="text-xs capitalize">
                {project.projectType}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center sm:self-center">
          <Link
            to={`/projets/${project._id}`}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-6 py-2.5 rounded-full text-sm font-medium transition-colors"
          >
            <Eye size={16} />
            Aperçu
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Projects() {
  const [searchParams, setSearchParams] = useState<ProjectSearchParams>({
    page: 1,
    limit: 20,
    sort: "score",
  });

  const { data, isLoading } = useSearchProjects(searchParams);
  const projects = data?.projects ?? [];
  const total = data?.total ?? 0;
  const pages = data?.pagination?.pages ?? 1;

  // Top Verified: featured + verified
  const { data: topVerifiedData } = useSearchProjects({
    limit: 4,
    featured: true,
    verifiedOnly: true,
    sort: "score",
  });
  const topVerified = topVerifiedData?.projects ?? [];

  // Nouveautés: recent
  const { data: recentData } = useSearchProjects({
    limit: 4,
    sort: "recent",
  });
  const nouveautes = recentData?.projects ?? [];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <h1 className="text-2xl font-bold text-slate-900 text-center">
          Découvrir les projets
        </h1>

        {/* Filtres et recherche */}
        <ProjectSearchFilters
          params={searchParams}
          onChange={setSearchParams}
          resultCount={total}
        />

        {/* Section Top Verified */}
        {topVerified.length > 0 && !searchParams.search && !searchParams.city && !searchParams.country && (
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-600" />
              Top Vérifiés
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topVerified.map((p) => (
                <ProjectCard key={p._id} project={p} showTrustScore />
              ))}
            </div>
          </section>
        )}

        {/* Section Nouveautés */}
        {nouveautes.length > 0 && !searchParams.search && !searchParams.city && !searchParams.country && (
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Nouveautés
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nouveautes.map((p) => (
                <ProjectCard key={p._id} project={p} showTrustScore />
              ))}
            </div>
          </section>
        )}

        {/* Résultats principaux */}
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            {searchParams.search || searchParams.city || searchParams.country || searchParams.projectType || searchParams.verifiedOnly
              ? "Résultats"
              : "Tous les projets"}
          </h2>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p>Aucun projet ne correspond à vos critères.</p>
              <p className="text-sm mt-1">Modifiez les filtres ou la recherche.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <ProjectCard key={project._id} project={project} showTrustScore />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center gap-2 pt-6">
              <button
                onClick={() =>
                  setSearchParams((p) => ({ ...p, page: Math.max(1, (p.page ?? 1) - 1) }))
                }
                disabled={searchParams.page === 1}
                className="px-4 py-2 rounded-lg border border-slate-200 disabled:opacity-50"
              >
                Précédent
              </button>
              <span className="px-4 py-2 text-sm text-slate-600">
                Page {searchParams.page ?? 1} / {pages}
              </span>
              <button
                onClick={() =>
                  setSearchParams((p) => ({ ...p, page: Math.min(pages, (p.page ?? 1) + 1) }))
                }
                disabled={(searchParams.page ?? 1) >= pages}
                className="px-4 py-2 rounded-lg border border-slate-200 disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
