import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Trophy, ShieldCheck, Euro, Calendar, FileText, Loader2, MapPin } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useComparison } from "@/hooks/useApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/currency";

const FIRSTIMMO_URL = import.meta.env.VITE_FIRSTIMMO_URL || 'http://localhost:8084';
const projectUrl = (id: string) => `${FIRSTIMMO_URL}/Pproject?id=${id}`;

const LABELS: Record<string, string> = {
  bestTrustScore:       "Meilleur score de confiance",
  lowestPrice:          "Prix le plus bas",
  earliestDelivery:     "Livraison la plus rapide",
  mostFrequentUpdates:  "Mises à jour les plus récentes",
  mostDocuments:        "Plus de documents",
  fastestResponse:      "Réponse la plus rapide",
};

export default function ComparisonDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: comparison, isLoading, error } = useComparison(id);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !comparison) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-slate-500">Comparaison introuvable</p>
          <Link to="/comparer" className="text-sky-500 hover:underline mt-2 inline-block">
            Créer une comparaison
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const projects = Array.isArray(comparison.projects) ? comparison.projects : [];
  const insights = comparison.insights || {};
  const winner = comparison.winner;
  const metrics = comparison.metrics;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <Link
          to="/comparer"
          className="inline-flex items-center gap-2 text-sky-500 hover:text-sky-600 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la comparaison
        </Link>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-2xl font-bold text-slate-900">Résultat de la comparaison</h1>
          {winner != null && projects[winner.winnerIndex] && (
            <Badge className="bg-amber-100 text-amber-800 border border-amber-300 px-3 py-1">
              <Trophy className="w-4 h-4 mr-1.5" />
              Gagnant : {(projects[winner.winnerIndex] as any).title}
            </Badge>
          )}
        </div>

        {comparison.notes && (
          <p className="text-slate-700 bg-sky-50 border border-sky-100 p-3 rounded-lg text-sm">
            {comparison.notes}
          </p>
        )}

        {/* Cartes projets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((proj: any, idx: number) => {
            const p = typeof proj === "object" ? proj : { _id: proj, title: "Projet" };
            const isWinner = winner?.winnerIndex === idx;
            const price = metrics?.prices?.[idx];
            const trustScore = metrics?.trustScores?.[idx];
            const deliveryDate = metrics?.deliveryDates?.[idx];
            const docCount = metrics?.documentCounts?.[idx];

            return (
              <Card
                key={p._id}
                className={isWinner ? "ring-2 ring-amber-400 shadow-md" : "shadow-sm"}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between gap-2">
                    <span className="truncate">{p.title || `Projet ${idx + 1}`}</span>
                    {isWinner && <Trophy className="w-5 h-5 text-amber-500 flex-shrink-0" />}
                  </CardTitle>
                  {(p.city || p.area) && (
                    <p className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {p.area || p.city}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {trustScore != null && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <ShieldCheck className="w-4 h-4" />
                        Score de confiance
                      </span>
                      <span className="font-semibold">{trustScore}/100</span>
                    </div>
                  )}
                  {price != null && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Euro className="w-4 h-4" />
                        Prix à partir de
                      </span>
                      <span className="font-semibold">{formatPrice(price, p.currency).display}</span>
                    </div>
                  )}
                  {deliveryDate && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Calendar className="w-4 h-4" />
                        Livraison
                      </span>
                      <span className="font-semibold">
                        {new Date(deliveryDate).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}
                      </span>
                    </div>
                  )}
                  {docCount != null && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <FileText className="w-4 h-4" />
                        Documents
                      </span>
                      <span className="font-semibold">{docCount}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-100">
                    <a
                      href={projectUrl(p._id)}
                      className="inline-flex items-center gap-1 text-sky-500 hover:text-sky-600 text-xs font-medium"
                    >
                      Voir le projet →
                    </a>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Détail par critère */}
        {Object.keys(insights).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Détail par critère</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {Object.entries(LABELS).map(([key, label]) => {
                  const insight = (insights as any)[key];
                  if (!insight || insight.index == null) return null;
                  const project = projects[insight.index];
                  const name =
                    typeof project === "object" && project?.title
                      ? project.title
                      : `Projet ${insight.index + 1}`;
                  const isWinner = winner?.winnerIndex === insight.index;
                  return (
                    <li
                      key={key}
                      className="flex justify-between items-center gap-3 py-2 px-3 rounded-md border border-slate-100 bg-slate-50"
                    >
                      <span className="text-slate-600">{label}</span>
                      <span className={`font-semibold text-right ${isWinner ? "text-amber-600" : "text-slate-900"}`}>
                        {isWinner && <Trophy className="w-3 h-3 inline mr-1 text-amber-500" />}
                        {name}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
