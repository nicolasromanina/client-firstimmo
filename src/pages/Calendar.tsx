import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Calendar as CalendarIcon, Clock, MapPin, Video, Phone, Trash2, Plus } from "lucide-react";
import { request } from "@/lib/client";
import { useToast } from "@/hooks/use-toast";
import { format, isToday, isTomorrow, isThisWeek, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { BookingWidget } from "@/components/booking/BookingWidget";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

type Appointment = {
  _id: string;
  scheduledAt: string;
  type: "visio" | "physique" | "phone";
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes?: string;
  project?: { _id: string; name?: string; title?: string };
  promoteur?: { _id: string; organizationName?: string };
};

const appointmentTypeLabel: Record<string, string> = {
  visio: "Visioconférence",
  physique: "Visite physique",
  phone: "Appel téléphonique",
};

const appointmentTypeIcon = (type: string) => {
  if (type === "visio") return <Video className="w-4 h-4" />;
  if (type === "phone") return <Phone className="w-4 h-4" />;
  return <MapPin className="w-4 h-4" />;
};

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    completed: "bg-gray-100 text-gray-700",
  };
  const labels: Record<string, string> = {
    pending: "En attente",
    confirmed: "Confirmé",
    cancelled: "Annulé",
    completed: "Terminé",
  };
  return <Badge className={map[status] || ""}>{labels[status] || status}</Badge>;
};

const dateLabel = (dateStr: string) => {
  const d = parseISO(dateStr);
  if (isToday(d)) return "Aujourd'hui";
  if (isTomorrow(d)) return "Demain";
  return format(d, "EEEE d MMMM yyyy", { locale: fr });
};

export default function Calendar() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);

  const { data, isLoading } = useQuery<{ appointments: Appointment[] }>({
    queryKey: ["client-appointments"],
    queryFn: () => request({ url: "/api/client/appointments", method: "get" }),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => request({ url: `/api/client/appointments/${id}/cancel`, method: "patch" }),
    onSuccess: () => {
      toast({ title: "RDV annulé", description: "Le rendez-vous a été annulé avec succès." });
      queryClient.invalidateQueries({ queryKey: ["client-appointments"] });
      setCancelTarget(null);
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible d'annuler ce rendez-vous.", variant: "destructive" });
    },
  });

  const appointments: Appointment[] = data?.appointments || (Array.isArray(data) ? (data as any) : []);
  const upcoming = appointments
    .filter((a) => a.status !== "cancelled" && new Date(a.scheduledAt) >= new Date())
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  const past = appointments
    .filter((a) => a.status === "completed" || new Date(a.scheduledAt) < new Date())
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
    .slice(0, 10);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <CalendarIcon className="w-6 h-6 text-sky-500" />
              Mes rendez-vous
            </h1>
            <p className="text-slate-500 text-sm mt-1">Gérez vos rendez-vous avec les promoteurs</p>
          </div>
          <Button onClick={() => setBookingOpen(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nouveau RDV
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
          </div>
        ) : (
          <>
            {/* Upcoming appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">À venir ({upcoming.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {upcoming.length === 0 ? (
                  <p className="text-slate-500 text-sm py-4 text-center">Aucun rendez-vous à venir.</p>
                ) : (
                  <div className="space-y-3">
                    {upcoming.map((appt) => (
                      <div
                        key={appt._id}
                        className="flex items-start justify-between p-4 rounded-xl border border-slate-100 bg-white hover:shadow-sm transition-shadow"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                            {appointmentTypeIcon(appt.type)}
                            <span>{appointmentTypeLabel[appt.type] || appt.type}</span>
                            {statusBadge(appt.status)}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-slate-500">
                            <CalendarIcon className="w-3.5 h-3.5" />
                            <span>{dateLabel(appt.scheduledAt)}</span>
                            <Clock className="w-3.5 h-3.5 ml-2" />
                            <span>{format(parseISO(appt.scheduledAt), "HH:mm")}</span>
                          </div>
                          {appt.project && (
                            <div className="text-xs text-slate-400">
                              Projet : {(appt.project as any).name || (appt.project as any).title || appt.project._id}
                            </div>
                          )}
                          {appt.notes && <p className="text-xs text-slate-400 italic mt-1">{appt.notes}</p>}
                        </div>
                        {appt.status !== "cancelled" && appt.status !== "completed" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => setCancelTarget(appt._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Past appointments */}
            {past.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base text-slate-500">Historique</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {past.map((appt) => (
                      <div
                        key={appt._id}
                        className="flex items-start justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 opacity-75"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                            {appointmentTypeIcon(appt.type)}
                            <span>{appointmentTypeLabel[appt.type] || appt.type}</span>
                            {statusBadge(appt.status)}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            <CalendarIcon className="w-3 h-3" />
                            <span>{format(parseISO(appt.scheduledAt), "d MMMM yyyy à HH:mm", { locale: fr })}</span>
                          </div>
                          {appt.project && (
                            <div className="text-xs text-slate-400">
                              Projet : {(appt.project as any).name || (appt.project as any).title || appt.project._id}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Booking dialog */}
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Prendre un rendez-vous</DialogTitle>
            <DialogDescription>
              Pour prendre un rendez-vous, rendez-vous sur la page d'un projet et utilisez le formulaire de réservation dédié.
            </DialogDescription>
          </DialogHeader>
          <Button variant="outline" onClick={() => setBookingOpen(false)}>Fermer</Button>
        </DialogContent>
      </Dialog>

      {/* Cancel confirmation */}
      <AlertDialog open={!!cancelTarget} onOpenChange={(open) => !open && setCancelTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler ce rendez-vous ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le promoteur sera notifié de l'annulation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Retour</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => cancelTarget && cancelMutation.mutate(cancelTarget)}
            >
              {cancelMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmer l'annulation"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
