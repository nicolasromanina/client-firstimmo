import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Star, Trash2, Edit2, CheckCircle, Clock, XCircle } from "lucide-react";
import { request } from "@/lib/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
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
  project?: { _id: string; name?: string; title?: string };
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

const statusInfo = (status: string) => {
  if (status === "published") return { label: "Publié", icon: <CheckCircle className="w-3.5 h-3.5" />, class: "bg-green-100 text-green-700" };
  if (status === "rejected") return { label: "Rejeté", icon: <XCircle className="w-3.5 h-3.5" />, class: "bg-red-100 text-red-700" };
  return { label: "En attente", icon: <Clock className="w-3.5 h-3.5" />, class: "bg-yellow-100 text-yellow-700" };
};

export default function Reviews() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

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
              return (
                <Card key={review._id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base">
                          {review.project
                            ? (review.project.name || review.project.title || review.project._id)
                            : "Projet inconnu"}
                        </CardTitle>
                        <CardDescription>
                          {format(new Date(review.createdAt), "d MMMM yyyy", { locale: fr })}
                        </CardDescription>
                      </div>
                      <Badge className={`flex items-center gap-1 ${info.class}`}>
                        {info.icon}
                        {info.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <StarRating value={review.rating} />
                      {review.comment && (
                        <p className="text-slate-600 text-sm leading-relaxed">{review.comment}</p>
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
