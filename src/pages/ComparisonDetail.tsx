import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Trophy, ShieldCheck, Euro, Calendar, FileText, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useComparison } from "@/hooks/useApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/currency";

const LABELS = {
  bestTrustScore: "Meilleur score confiance",
  lowestPrice: "Prix le plus bas",
  earliestDelivery: "Livraison la plus rapide",
  mostFrequentUpdates: "Mises à jour les plus récentes",
  mostDocuments: "Plus de documents",
  fastestResponse: "Réponse la plus rapide",
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
          className="inline-flex items-center gap-2 text-sky-500 hover:text-sky-600"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-2xl font-bold text-slate-900">Résultat de la comparaison</h1>
          {winner != null && projects[winner.winnerIndex] && (
            <Badge className="bg-amber-100 text-amber-800 border-amber-300">
              <Trophy className="w-4 h-4 mr-1" />
              Gagnant: {(projects[winner.winnerIndex] as any).title}
            </Badge>
          )}
        </div>

        {comparison.notes && (
          <p className="text-slate-600 bg-slate-50 p-3 rounded-lg">{comparison.notes}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((proj: any, idx: number) => {
            const p = typeof proj === "object" ? proj : { _id: proj, title: "Projet" };
            const isWinner = winner?.winnerIndex === idx;
            return (
              <Card key={p._id} className={isWinner ? "ring-2 ring-amber-400" : ""}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="truncate">{p.title}</span>
                    {isWinner && <Trophy className="w-5 h-5 text-amber-500 flex-shrink-0" />}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {metrics?.trustScores?.[idx] != null && (
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-slate-500" />
                      <span>Score: {metrics.trustScores[idx]}/100</span>
                    </div>
                  )}
                  {metrics?.prices?.[idx] != null && (
                    <div className="flex items-center gap-2">
                      <Euro className="w-4 h-4 text-slate-500" />
                      <span>{formatPrice(metrics.prices[idx]).display}</span>
                    </div>
                  )}
                  {metrics?.deliveryDates?.[idx] && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span>
                        {new Date(metrics.deliveryDates[idx]).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  )}
                  {metrics?.documentCounts?.[idx] != null && (
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-500" />
                      <span>{metrics.documentCounts[idx]} documents</span>
                    </div>
                  )}
                  <Link
                    to={`/projets/${p._id}`}
                    className="inline-block mt-2 text-sky-500 hover:underline text-xs"
                  >
                    Voir le projet →
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

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
                const name = typeof project === "object" && project?.title ? project.title : `Projet ${insight.index + 1}`;
                return (
                  <li key={key} className="flex justify-between items-center py-1 border-b border-slate-100 last:border-0">
                    <span className="text-slate-600">{label}</span>
                    <span className="font-medium text-slate-900">{name}</span>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
