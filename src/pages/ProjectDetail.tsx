import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, ShieldCheck, Calendar, Eye, Flag, Star } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectService } from "@/lib/services";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice } from "@/lib/currency";
import { TrustBlock } from "@/components/trust/TrustBlock";
import { ReportModal } from "@/components/report/ReportModal";
import { request } from "@/lib/client";
import { useToast } from "@/hooks/use-toast";

const StarInput = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((s) => (
      <button key={s} type="button" onClick={() => onChange(s)}>
        <Star className={`w-6 h-6 transition-colors ${s <= value ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-300"}`} />
      </button>
    ))}
  </div>
);

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [reportOpen, setReportOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: () => projectService.getProject(id!),
    enabled: !!id,
  });
  
  const { data: updates = [] } = useQuery({
    queryKey: ["project-updates", id],
    queryFn: () => projectService.getProjectUpdates(id!),
    enabled: !!id,
  });

  const { data: myReviewData } = useQuery({
    queryKey: ["my-review", id],
    queryFn: () => request({ url: `/reviews/my`, method: "get" }),
    enabled: !!id,
  });

  const myReviews = (myReviewData as any)?.reviews || [];
  const existingReview = myReviews.find((r: any) => {
    const pid = r.project?._id || r.project;
    return pid === id;
  });

  const createReviewMutation = useMutation({
    mutationFn: () => request({ url: "/reviews", method: "post", data: { projectId: id, rating: reviewRating, comment: reviewComment } }),
    onSuccess: () => {
      toast({ title: "Avis envoyé", description: "Votre avis est en attente de modération." });
      queryClient.invalidateQueries({ queryKey: ["my-review", id] });
      setReviewRating(0);
      setReviewComment("");
    },
    onError: (err: any) => {
      toast({ title: "Erreur", description: err?.message || "Impossible d'envoyer l'avis.", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
        </div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-slate-500">Projet non trouvé</p>
          <Link to="/projets" className="text-sky-500 hover:underline mt-2 inline-block">
            Retour à la liste
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const image =
    project.media?.coverImage ||
    project.coverImage ||
    project.images?.[0] ||
    "";
  const location = project.area || project.city || project.location?.city || "";
  const priceFrom = project.priceFrom ?? project.priceRange?.min ?? project.price;
  const priceFormatted = formatPrice(priceFrom, project.currency);
  
  // Extraire les données pour TrustBlock
  const promoteur = (project as any).promoteur;
  const documents = (project as any).documents || [];
  const documentsCount = documents.length;
  const updatesCount = updates.length;
  const lastUpdate = updates[0]?.createdAt || project.updatedAt;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Link
          to="/projets"
          className="inline-flex items-center gap-2 text-sky-500 hover:text-sky-600"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la liste
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {image && (
              <img
                src={typeof image === "string" ? image : (image as any)?.url ?? ""}
                alt={project.title}
                className="w-full h-64 object-cover rounded-xl"
              />
            )}
            <Card>
              <CardHeader>
                <CardTitle>{project.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">{project.description}</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {/* Trust Block */}
            <TrustBlock
              projectTrustScore={project.trustScore}
              promoteur={promoteur}
              documentsCount={documentsCount}
              updatesCount={updatesCount}
              lastUpdateDate={lastUpdate}
            />

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <span>{location}</span>
                  </div>
                )}
                {priceFrom && (
                  <div className="text-lg font-semibold">
                    {priceFormatted.display}
                  </div>
                )}
                {project.projectType && (
                  <Badge variant="outline" className="capitalize">
                    {project.projectType}
                  </Badge>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-slate-500 hover:text-red-600 w-full justify-start mt-2"
                  onClick={() => setReportOpen(true)}
                >
                  <Flag className="w-4 h-4 mr-2" />
                  Signaler ce projet
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Section Avis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="w-5 h-5 text-yellow-400" />
              Laisser un avis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {existingReview ? (
              <div className="space-y-2">
                <p className="text-sm text-slate-500">Vous avez déjà laissé un avis pour ce projet.</p>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} className={`w-4 h-4 ${s <= existingReview.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
                  ))}
                </div>
                {existingReview.comment && <p className="text-sm text-slate-600 italic">{existingReview.comment}</p>}
                <Badge className={existingReview.status === "published" ? "bg-green-100 text-green-700" : existingReview.status === "rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}>
                  {existingReview.status === "published" ? "Publié" : existingReview.status === "rejected" ? "Rejeté" : "En attente"}
                </Badge>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Note :</p>
                  <StarInput value={reviewRating} onChange={setReviewRating} />
                </div>
                <Textarea
                  placeholder="Partagez votre expérience avec ce projet (optionnel)..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  maxLength={1000}
                  rows={3}
                />
                <Button
                  onClick={() => createReviewMutation.mutate()}
                  disabled={reviewRating === 0 || createReviewMutation.isPending}
                  size="sm"
                >
                  {createReviewMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Envoyer l'avis
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <ReportModal
          open={reportOpen}
          onOpenChange={setReportOpen}
          targetType="project"
          targetId={project._id}
          targetLabel={project.title}
        />
      </div>
    </DashboardLayout>
  );
}
