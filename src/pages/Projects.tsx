import { useState } from "react";
import { Eye, Loader2, ShieldCheck, Sparkles, Star, Zap, Crown, BarChart2 } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AdvancementModal from "@/components/projects/AdvancementModal";

const FIRSTIMMO_URL = import.meta.env.VITE_FIRSTIMMO_URL || 'http://localhost:8084';
const projectUrl = (id: string) => `${FIRSTIMMO_URL}/Pproject?id=${id}`;

import projectImmeuble from "@/assets/projet-1.png";
import projectResidence from "@/assets/projet-2.png";
import projet3 from "@/assets/projet-3.png";
import localisatisationIcon from "@/assets/localisation-icon.svg";
import { useSearchProjects } from "@/hooks/useApi";
import { ProjectSearchFilters } from "@/components/projects/ProjectSearchFilters";
import type { ProjectSearchParams } from "@/lib/services";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/currency";

const fallbackImages = [projectImmeuble, projectResidence, projet3];

function getImage(project: any) {
  const img =
    project.media?.coverImage ||
    project.coverImage ||
    project.images?.[0] ||
    project.image ||
    fallbackImages[Math.abs((project.title || project._id || "").length) % 3];
  return typeof img === "string" ? img : (img as any)?.url ?? "";
}

/** Retourne le libellé du boost actif, ou null si aucun */
function getBoostLabel(project: any): { label: string; tier: 'basic' | 'premium' | 'enterprise' } | null {
  if (!project.isFeatured) return null;
  const now = new Date();
  const activeBoost = project.boosts?.find(
    (b: any) => b.status === 'active' && new Date(b.endDate) > now
  );
  if (!activeBoost) return { label: 'Mis en avant', tier: 'basic' };
  switch (activeBoost.type) {
    case 'premium':    return { label: 'Premium', tier: 'premium' };
    case 'enterprise': return { label: 'Premium +', tier: 'enterprise' };
    case 'custom':     return { label: 'Partenaire', tier: 'enterprise' };
    default:           return { label: 'Mis en avant', tier: 'basic' };
  }
}

const boostStyles = {
  basic:      'bg-amber-100 text-amber-700 border-amber-200',
  premium:    'bg-orange-100 text-orange-700 border-orange-200',
  enterprise: 'bg-purple-100 text-purple-700 border-purple-200',
};

function BoostBadge({ project }: { project: any }) {
  const boost = getBoostLabel(project);
  if (!boost) return null;
  const Icon = boost.tier === 'enterprise' ? Crown : Zap;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${boostStyles[boost.tier]}`}>
      <Icon size={10} />
      {boost.label}
    </span>
  );
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={11}
          className={s <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-slate-300"}
        />
      ))}
      <span className="text-xs text-slate-500 ml-0.5">{rating.toFixed(1)} ({count})</span>
    </div>
  );
}

/** Carte horizontale scrollable pour la section "Mis en avant" */
function SponsoredCard({ project }: { project: any }) {
  const image = getImage(project);
  const title = project.title || project.name || "Projet";
  const location = project.area || project.city || project.location?.city || project.location || "—";
  const priceFrom = project.priceFrom ?? project.priceRange?.min ?? project.price;
  const priceFormatted = formatPrice(priceFrom, project.currency);
  const trustScore = project.trustScore ?? 0;
  const avgRating: number | null = project.avgRating ?? null;
  const reviewCount: number = project.reviewCount ?? 0;
  const boost = getBoostLabel(project);
  const borderColor = boost?.tier === 'enterprise' ? 'border-t-purple-400' : boost?.tier === 'premium' ? 'border-t-orange-400' : 'border-t-amber-400';

  return (
    <div className={`w-64 flex-shrink-0 bg-white text-slate-900 rounded-2xl shadow-sm border border-slate-100 border-t-2 ${borderColor} hover:shadow-md transition-shadow overflow-hidden flex flex-col dark:bg-white dark:text-slate-900 dark:border-slate-100`}>
      {/* Image */}
      <div className="relative">
        <img src={image} alt={title} className="w-full h-36 object-cover" />
        <div className="absolute top-2 left-2">
          <BoostBadge project={project} />
        </div>
      </div>

      {/* Contenu */}
      <div className="flex flex-col flex-1 p-3 gap-1.5">
        <h3 className="font-semibold text-slate-900 text-sm leading-tight line-clamp-2">{title}</h3>
        <p className="text-xs text-slate-500 line-clamp-2 flex-1">
          {project.description || "Description du projet immobilier"}
        </p>
        <div className="flex items-center gap-1 text-slate-400">
          <img src={localisatisationIcon} alt="" className="w-3 h-3" />
          <span className="text-xs">{location}</span>
        </div>
        <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-100">
          <div>
            <div className="text-sm font-semibold text-sky-600">{priceFormatted.display}</div>
            {avgRating !== null && reviewCount > 0 ? (
              <StarRating rating={avgRating} count={reviewCount} />
            ) : (
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-green-500" />
                <span className="text-[11px] text-slate-400">Score {trustScore}/100</span>
              </div>
            )}
          </div>
          <a
            href={projectUrl(project._id)}

            className="flex items-center gap-1 bg-sky-500 hover:bg-sky-600 text-white px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap flex-shrink-0"
          >
            <Eye size={12} />
            Voir
          </a>
        </div>
      </div>
    </div>
  );
}

/** Carte verticale pour les grilles (Nouveautés, Top Vérifiés) */
function GridProjectCard({ project, onAdvancement }: { project: any; onAdvancement: (p: any) => void }) {
  const image = getImage(project);
  const title = project.title || project.name || "Projet";
  const location = project.area || project.city || project.location?.city || project.location || "—";
  const priceFrom = project.priceFrom ?? project.priceRange?.min ?? project.price;
  const priceFormatted = formatPrice(priceFrom, project.currency);
  const trustScore = project.trustScore ?? 0;
  const avgRating: number | null = project.avgRating ?? null;
  const reviewCount: number = project.reviewCount ?? 0;

  return (
    <div className="bg-white text-slate-900 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow overflow-hidden flex flex-col dark:bg-white dark:text-slate-900 dark:border-slate-100">
      <div className="relative">
        <img src={image} alt={title} className="w-full h-44 object-cover flex-shrink-0" />
        {project.isFeatured && (
          <div className="absolute top-2 left-2">
            <BoostBadge project={project} />
          </div>
        )}
      </div>
      <div className="flex flex-col flex-1 p-4 gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-slate-900 text-sm leading-tight line-clamp-2 flex-1">{title}</h3>
          <span className="text-sm font-medium text-sky-600 whitespace-nowrap">{priceFormatted.display}</span>
        </div>
        <p className="text-xs text-slate-500 line-clamp-2 flex-1">
          {project.description || "Description du projet immobilier"}
        </p>
        <div className="flex items-center gap-1 text-slate-400">
          <img src={localisatisationIcon} alt="" className="w-3.5 h-3.5" />
          <span className="text-xs">{location}</span>
          {project.projectType && (
            <Badge variant="outline" className="text-xs capitalize ml-1 bg-white text-slate-600 border-slate-200">
              {project.projectType}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1 pt-2 border-t border-slate-100">
          <div className="flex-1 flex flex-wrap items-center gap-2 min-w-0">
            {avgRating !== null && reviewCount > 0 ? (
              <StarRating rating={avgRating} count={reviewCount} />
            ) : (
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-green-500" />
                <span className="text-xs text-slate-500">Score {trustScore}/100</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onAdvancement(project)}
              className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-800 text-white px-4 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap"
            >
              <BarChart2 size={13} />
              Avancement
            </button>
            <a
              href={projectUrl(project._id)}
              className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-600 text-white px-4 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap"
            >
              <Eye size={13} />
              Aperçu
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Carte horizontale pour la liste principale */
function ProjectCard({ project, onAdvancement }: { project: any; onAdvancement: (p: any) => void }) {
  const image = getImage(project);
  const title = project.title || project.name || "Projet";
  const location = project.area || project.city || project.location?.city || project.location || "—";
  const priceFrom = project.priceFrom ?? project.priceRange?.min ?? project.price;
  const priceFormatted = formatPrice(priceFrom, project.currency);
  const trustScore = project.trustScore ?? 0;
  const avgRating: number | null = project.avgRating ?? null;
  const reviewCount: number = project.reviewCount ?? 0;

  return (
    <div className="bg-white text-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow dark:bg-white dark:text-slate-900 dark:border-slate-100">
      <div className="flex gap-4">
        <div className="relative flex-shrink-0">
          <img
            src={image}
            alt={title}
            className="w-24 h-20 sm:w-32 sm:h-24 rounded-xl object-cover"
          />
          {project.isFeatured && (
            <div className="absolute -top-1.5 -left-1.5">
              <BoostBadge project={project} />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-slate-900 text-sm leading-tight">{title}</h3>
            <span className="text-sm text-slate-500 whitespace-nowrap">{priceFormatted.display}</span>
          </div>
          <p className="text-xs text-slate-500 line-clamp-1 mb-2">
            {project.description || "Description du projet immobilier"}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 text-slate-400">
              <img src={localisatisationIcon} alt="" className="w-3.5 h-3.5" />
              <span className="text-xs">{location}</span>
            </div>
            {project.projectType && (
              <Badge variant="outline" className="text-xs capitalize bg-white text-slate-600 border-slate-200">
                {project.projectType}
              </Badge>
            )}
            {avgRating !== null && reviewCount > 0 ? (
              <StarRating rating={avgRating} count={reviewCount} />
            ) : (
              <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-600 border border-slate-200">
                <ShieldCheck className="w-3 h-3 mr-1" />
                Score {trustScore}/100
              </Badge>
            )}
            <div className="ml-auto flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => onAdvancement(project)}
                className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-800 text-white px-4 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap"
              >
                <BarChart2 size={13} />
                Avancement
              </button>
              <a
                href={projectUrl(project._id)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-600 text-white px-4 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap"
              >
                <Eye size={13} />
                Aperçu
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Projects() {
  const [searchParams, setSearchParams] = useState<ProjectSearchParams>({
    page: 1,
    limit: 20,
    sort: "ranking", // Use weighted ranking algorithm: 30% trust + 15% recency + 50% boost + 5% engagement
  });
  const [advancementProject, setAdvancementProject] = useState<any | null>(null);

  const { data, isLoading } = useSearchProjects(searchParams);
  const projects = data?.projects ?? [];
  const total = data?.total ?? 0;
  const pages = data?.pagination?.pages ?? 1;

  // Projets mis en avant / boostés
  const { data: sponsoredData } = useSearchProjects({
    limit: 8,
    featured: true,
    sort: "ranking", // Use weighted ranking algorithm for consistent prioritization
  });
  const sponsored = sponsoredData?.projects ?? [];

  // Top Vérifiés : featured + plan vérifié
  const { data: topVerifiedData } = useSearchProjects({
    limit: 4,
    featured: true,
    verifiedOnly: true,
    sort: "ranking", // Use weighted ranking algorithm for consistent prioritization
  });
  const topVerified = topVerifiedData?.projects ?? [];

  // Nouveautés
  const { data: recentData } = useSearchProjects({
    limit: 4,
    sort: "recent",
  });
  const nouveautes = recentData?.projects ?? [];

  const hasActiveSearch =
    !!searchParams.search || !!searchParams.city || !!searchParams.country ||
    !!searchParams.projectType || !!searchParams.verifiedOnly;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-sky-50/60 to-amber-50/40 p-6 sm:p-8">
          <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-sky-200/30 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-amber-200/30 blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Decouvrir les projets
            </h1>
            <p className="text-sm text-slate-600 mt-2">
              Recherche intelligente, filtres precis et tri rapide pour trouver le bon projet.
            </p>
          </div>
        </section>

        <div className="sticky top-3 z-20">
          <ProjectSearchFilters
            params={searchParams}
            onChange={setSearchParams}
            resultCount={total}
          />
        </div>

        {/* Section Mis en avant (boostés) */}
        {sponsored.length > 0 && !hasActiveSearch && (
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
              Mis en avant
              <span className="text-xs font-normal text-slate-400 ml-1">Projets sponsorisés</span>
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-3 -mx-1 px-1 snap-x snap-mandatory">
              {sponsored.map((p) => (
                <div key={p._id} className="snap-start">
                  <SponsoredCard project={p} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section Top Vérifiés */}
        {topVerified.length > 0 && !hasActiveSearch && (
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-600" />
              Top Vérifiés
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {topVerified.map((p) => (
                <GridProjectCard key={p._id} project={p} onAdvancement={setAdvancementProject} />
              ))}
            </div>
          </section>
        )}

        {/* Section Nouveautés */}
        {nouveautes.length > 0 && !hasActiveSearch && (
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Nouveautés
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {nouveautes.map((p) => (
                <GridProjectCard key={p._id} project={p} onAdvancement={setAdvancementProject} />
              ))}
            </div>
          </section>
        )}

        {/* Résultats principaux */}
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            {hasActiveSearch ? "Résultats" : "Tous les projets"}
          </h2>
          {!isLoading && (
            <p className="text-sm text-slate-500 mb-3">
              {total} projet{total > 1 ? "s" : ""} disponible{total > 1 ? "s" : ""}.
            </p>
          )}

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
            <div className="space-y-3">
              {projects.map((project) => (
                <ProjectCard key={project._id} project={project} onAdvancement={setAdvancementProject} />
              ))}
            </div>
          )}

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

      {advancementProject && (
        <AdvancementModal
          project={advancementProject}
          onClose={() => setAdvancementProject(null)}
        />
      )}
    </DashboardLayout>
  );
}
