import { Download, FileText, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useClientBrochures } from "@/hooks/useApi";

const Brochures = () => {
  const { data, isLoading } = useClientBrochures();
  const brochures = data?.brochures || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-center text-2xl font-bold text-slate-900">Mes Brochures</h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
          </div>
        ) : brochures.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center text-slate-500">
            <FileText className="mx-auto mb-4 h-12 w-12 opacity-50" />
            <p>Aucune brochure disponible</p>
            <p className="mt-1 text-sm">Les brochures envoyees par les promoteurs apparaitront ici.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {brochures.map((brochure: any) => {
              const project = brochure.project || {};
              const coverImage = project.media?.coverImage || project.coverImage || '/placeholder.svg';
              return (
                <div
                  key={brochure._id}
                  className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="aspect-video w-full overflow-hidden bg-slate-100">
                    <img
                      src={coverImage}
                      alt={project.title || 'Projet'}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {project.title || 'Projet immobilier'}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {[project.city, project.country].filter(Boolean).join(', ')}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      Recu le {new Date(brochure.sentToClientDashboardAt || brochure.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                    {brochure.downloadLink && (
                      <a
                        href={brochure.downloadLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-2 rounded-full bg-sky-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-600"
                      >
                        <Download className="h-4 w-4" />
                        Telecharger
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Brochures;
