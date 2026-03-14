import { Download, FileText, Loader2, Calendar } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useClientBrochures } from "@/hooks/useApi";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const Brochures = () => {
  const { data, isLoading } = useClientBrochures();
  const { toast } = useToast();
  const [downloading, setDownloading] = useState<string | null>(null);

  // Extract data from API response structure { success, data }
  const brochuresData = data?.data || data || {};
  const brochures = Array.isArray(brochuresData)
    ? brochuresData
    : Array.isArray(brochuresData?.brochures)
      ? brochuresData.brochures
      : [];

  const getDownloadUrl = (downloadLink: string) => {
    if (!downloadLink) return null;
    // If it's already an absolute URL, return as-is
    if (downloadLink.startsWith('http://') || downloadLink.startsWith('https://')) {
      return downloadLink;
    }
    // If it's a relative path, construct full URL with API base
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return `${apiBase}${downloadLink}`;
  };

  const handleDownload = async (downloadLink: string, brochureId: string, projectTitle: string) => {
    const fullUrl = getDownloadUrl(downloadLink);
    if (!fullUrl) return;

    setDownloading(brochureId);

    try {
      // Track download on backend (marks downloadedAt on BrochureRequest)
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      fetch(`${apiBase}/api/brochures/track/download/${brochureId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      }).catch(() => {}); // Best effort tracking

      toast({
        title: 'Téléchargement en cours',
        description: `${projectTitle} va s'ouvrir...`
      });

      // Open file in same tab
      setTimeout(() => {
        window.location.href = fullUrl;
        setDownloading(null);
      }, 300);
    } catch (error) {
      console.error('Error downloading brochure:', error);
      // Still try to open the file even if tracking failed
      window.location.href = fullUrl;
      setDownloading(null);
    }
  };

  const sortedBrochures = [...brochures].sort((a, b) =>
    new Date(b.sentToClientDashboardAt || b.createdAt).getTime() -
    new Date(a.sentToClientDashboardAt || a.createdAt).getTime()
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">Mes Brochures</h1>
          <p className="text-slate-600">
            {brochures.length} brochure{brochures.length !== 1 ? 's' : ''} disponible{brochures.length !== 1 ? 's' : ''}
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="text-center">
              <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-sky-500" />
              <p className="text-slate-600">Chargement des brochures...</p>
            </div>
          </div>
        ) : brochures.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-12 text-center">
            <FileText className="mx-auto mb-4 h-16 w-16 text-slate-300" />
            <p className="text-lg font-medium text-slate-900">Aucune brochure disponible</p>
            <p className="mt-2 text-slate-600">Les brochures envoyées par les promoteurs apparaîtront ici.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sortedBrochures.map((brochure: any) => {
              const project = brochure.project || {};
              const coverImage = project.media?.coverImage || project.coverImage || '/placeholder.svg';
              const isDownloading = downloading === brochure._id;

              return (
                <div
                  key={brochure._id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:border-sky-200"
                >
                  {/* Image Container */}
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                    <img
                      src={coverImage}
                      alt={project.title || 'Projet'}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">
                        {project.title || 'Projet immobilier'}
                      </h3>
                      {(project.city || project.country) && (
                        <p className="mt-1 text-sm text-slate-600">
                          📍 {[project.city, project.country].filter(Boolean).join(', ')}
                        </p>
                      )}
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Reçu le {new Date(brochure.sentToClientDashboardAt || brochure.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    {/* Download Button */}
                    {brochure.downloadLink && (
                      <button
                        onClick={() => handleDownload(brochure.downloadLink, brochure._id, project.title || 'Brochure')}
                        disabled={isDownloading}
                        className="w-full mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-sky-600 disabled:opacity-75 disabled:cursor-not-allowed hover:shadow-lg"
                      >
                        {isDownloading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Ouverture...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4" />
                            Télécharger
                          </>
                        )}
                      </button>
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
