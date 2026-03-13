import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Star, Trash2, Edit2, CheckCircle, Clock, XCircle, Eye } from "lucide-react";
import { request } from "@/lib/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

const FIRSTIMMO_URL = import.meta.env.VITE_FIRSTIMMO_URL || "http://localhost:8084";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Review = {
  _id: string;
  rating: number;
  comment?: string;
  status: "pending" | "published" | "rejected";
  createdAt: string;
  project?: {
    _id: string;
    name?: string;
    title?: string;
    coverImage?: string;
    trustScore?: number;
    media?: { coverImage?: string };
    promoteur?: {
      organizationName?: string;
      logo?: string;
      trustScore?: number;
    };
  };
};

const StarRating = ({ value }: { value: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        className={`w-4 h-4 ${s <= value ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
      />
    ))}
  </div>
);

const resolveCoverImage = (project?: Review["project"]) => {
  if (!project) return null;
  const mediaCover = project.media?.coverImage;
  const directCover = project.coverImage;
  const url = (mediaCover || directCover || "").trim();
  return url || null;
};

const statusInfo = (status: string) => {
  if (status === "published") return { label: "Publié", icon: <CheckCircle className="w-3.5 h-3.5" />, class: "bg-green-100 text-green-700" };
  if (status === "rejected") return { label: "Rejeté", icon: <XCircle className="w-3.5 h-3.5" />, class: "bg-red-100 text-red-700" };
  return null;
};

const ProjectRatingSummary = ({ projectId }: { projectId: string }) => {
  const { data } = useQuery({
    queryKey: ["project-reviews", projectId],
    queryFn: () => request({ url: `/api/reviews/project/${projectId}`, method: "get" }),
    staleTime: 5 * 60 * 1000,
  });

  const reviews = Array.isArray(data?.reviews) ? data.reviews : [];
  if (!projectId) return null;

  const counts = [0, 0, 0, 0, 0];
  reviews.forEach((r: any) => {
    const rating = Math.round(Number(r?.rating || 0));
    if (rating >= 1 && rating <= 5) counts[rating - 1] += 1;
  });
  const total = counts.reduce((sum, n) => sum + n, 0);

  return (
    <div className="mt-2 space-y-1.5 text-xs text-slate-500">
      <p className="font-medium text-slate-600">Notes clients</p>
      {[5, 4, 3, 2, 1].map((star) => {
        const count = counts[star - 1];
        const percent = total > 0 ? Math.round((count / total) * 100) : 0;
        return (
          <div key={star} className="flex items-center gap-2">
            <span className="w-10 text-slate-500">★ {star}</span>
            <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-400 transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="w-8 text-right text-slate-700 font-medium">{count}</span>
          </div>
        );
      })}
    </div>
  );
};

export default function Reviews() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const navigate = useNavigate();

  const { data, isLoading } = useQuery<{ reviews: Review[] }>({
    queryKey: ["my-reviews"],
    queryFn: () => request({ url: "/api/reviews/my", method: "get" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => request({ url: `/api/reviews/${id}`, method: "delete" }),
    onSuccess: () => {
      toast({ title: "Avis supprimé", description: "Votre avis a été supprimé." });
      queryClient.invalidateQueries({ queryKey: ["my-reviews"] });
      setDeleteTarget(null);
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de supprimer cet avis.", variant: "destructive" });
    },
  });

  const reviews: Review[] = data?.reviews || (Array.isArray(data) ? (data as any) : []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-400" />
            Mes avis
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Retrouvez les avis que vous avez laissés sur les projets immobiliers
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
          </div>
        ) : reviews.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Star className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-slate-500">Vous n'avez pas encore laissé d'avis.</p>
              <p className="text-slate-400 text-sm mt-1">
                Rendez-vous sur la page d'un projet pour laisser un avis.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => {
              const info = statusInfo(review.status);
              const projectId = review.project?._id;
              const coverImage = resolveCoverImage(review.project);
              const projectScore = Number(review.project?.trustScore ?? 0);
              const promoteurName = review.project?.promoteur?.organizationName || "Promoteur";
              const promoteurScore = Number(review.project?.promoteur?.trustScore ?? 0);
              const promoteurLogo = review.project?.promoteur?.logo || "";
              return (
                <Card key={review._id}>
                  <CardHeader className="pb-2">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="h-16 w-24 overflow-hidden rounded-lg bg-slate-100 flex-shrink-0">
                          {coverImage ? (
                            <img
                              src={coverImage}
                              alt={review.project?.title || review.project?.name || "Projet"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-slate-100" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <CardTitle className="text-base">
                            {review.project
                              ? (review.project.name || review.project.title || review.project._id)
                              : "Projet inconnu"}
                          </CardTitle>
                          <CardDescription>
                            {format(new Date(review.createdAt), "d MMMM yyyy", { locale: fr })}
                          </CardDescription>
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium">
                              Score projet
                            </span>
                            <span className="font-semibold text-slate-800">{projectScore}/100</span>
                          </div>
                        </div>
                      </div>
                      {info && (
                        <Badge className={`flex items-center gap-1 ${info.class}`}>
                          {info.icon}
                          {info.label}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1 space-y-2">
                        <StarRating value={review.rating} />
                        {review.comment && (
                          <p className="text-slate-600 text-sm leading-relaxed">{review.comment}</p>
                        )}
                        {projectId && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="inline-flex items-center gap-2"
                            onClick={() => {
                              window.location.href = `${FIRSTIMMO_URL}/Pproject?id=${projectId}`;
                            }}
                          >
                            <Eye className="w-4 h-4" />
                            Aperçu du projet
                          </Button>
                        )}
                        {review.status !== "published" && (
                          <div className="flex items-center gap-2 pt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => setDeleteTarget(review._id)}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Supprimer
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="w-full md:w-56 lg:w-64">
                        <div className="mb-3 flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
                          {promoteurLogo ? (
                            <img
                              src={promoteurLogo}
                              alt={promoteurName}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold">
                              {promoteurName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">{promoteurName}</p>
                            <p className="text-xs text-slate-500">Score promoteur</p>
                          </div>
                          <div className="ml-auto text-sm font-semibold text-slate-900">
                            {promoteurScore}/100
                          </div>
                        </div>
                        {projectId && <ProjectRatingSummary projectId={projectId} />}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet avis ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
            >
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
