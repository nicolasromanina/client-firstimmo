import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useReportContent } from "@/hooks/useApi";
import { useToast } from "@/components/ui/use-toast";

const REASON_LABELS: Record<string, string> = {
  fraud: "Fraude / Arnaque",
  misleading: "Information trompeuse",
  outdated: "Contenu obsolète",
  inappropriate: "Contenu inapproprié",
  spam: "Spam",
  other: "Autre",
};

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetType: "project" | "update" | "document" | "promoteur";
  targetId: string;
  targetLabel?: string;
  onSuccess?: () => void;
}

export function ReportModal({
  open,
  onOpenChange,
  targetType,
  targetId,
  targetLabel,
  onSuccess,
}: ReportModalProps) {
  const [reason, setReason] = useState<string>("");
  const [description, setDescription] = useState("");
  const reportMutation = useReportContent();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason || !description.trim()) return;

    try {
      await reportMutation.mutateAsync({
        targetType,
        targetId,
        reason: reason as any,
        description: description.trim(),
      });
      toast({ title: "Signalement envoyé", description: "Merci. Notre équipe traitera votre signalement." });
      onOpenChange(false);
      setReason("");
      setDescription("");
      onSuccess?.();
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err?.message || "Impossible d'envoyer le signalement",
        variant: "destructive",
      });
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setReason("");
      setDescription("");
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Signaler un contenu
          </DialogTitle>
        </DialogHeader>
        {targetLabel && (
          <p className="text-sm text-slate-500">
            Vous signalez: <strong>{targetLabel}</strong>
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="report-reason">Motif *</Label>
            <Select value={reason} onValueChange={setReason} required>
              <SelectTrigger id="report-reason" className="mt-1">
                <SelectValue placeholder="Choisir un motif" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(REASON_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="report-description">Description *</Label>
            <Textarea
              id="report-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez le problème en quelques mots..."
              rows={4}
              className="mt-1"
              required
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={reportMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={!reason || !description.trim() || reportMutation.isPending}
            >
              {reportMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Envoi...
                </>
              ) : (
                "Envoyer le signalement"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
