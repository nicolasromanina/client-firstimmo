import { ShieldCheck, Award, FileText, Calendar, TrendingUp, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface BadgeInfo {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  trustScoreBonus?: number;
}

interface PromoteurInfo {
  _id?: string;
  organizationName?: string;
  trustScore?: number;
  badges?: Array<{
    badgeId?: BadgeInfo | string;
    awardedAt?: string;
  }>;
  plan?: string;
  kycStatus?: string;
  complianceStatus?: string;
}

interface TrustBlockProps {
  projectTrustScore?: number;
  promoteur?: PromoteurInfo | any;
  documentsCount?: number;
  updatesCount?: number;
  lastUpdateDate?: string;
  className?: string;
}

export function TrustBlock({
  projectTrustScore,
  promoteur,
  documentsCount = 0,
  updatesCount = 0,
  lastUpdateDate,
  className,
}: TrustBlockProps) {
  const trustScore = projectTrustScore ?? promoteur?.trustScore ?? 0;
  const promoteurScore = promoteur?.trustScore ?? 0;
  const badges = promoteur?.badges || [];
  
  // Déterminer la couleur et le label selon le score
  const getScoreColor = (score: number) => {
    if (score >= 85) return { color: "text-green-600", bg: "bg-green-50", border: "border-green-200", label: "Excellent" };
    if (score >= 70) return { color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", label: "Bon" };
    if (score >= 50) return { color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200", label: "Moyen" };
    return { color: "text-red-600", bg: "bg-red-50", border: "border-red-200", label: "Faible" };
  };

  const scoreInfo = getScoreColor(trustScore);
  
  // Calculer les facteurs de transparence
  const transparencyFactors = [
    {
      label: "Documents publics",
      value: documentsCount,
      max: 10,
      icon: FileText,
      status: documentsCount >= 5 ? "excellent" : documentsCount >= 3 ? "good" : "needs-improvement",
    },
    {
      label: "Mises à jour régulières",
      value: updatesCount,
      max: 20,
      icon: Calendar,
      status: updatesCount >= 10 ? "excellent" : updatesCount >= 5 ? "good" : "needs-improvement",
    },
    {
      label: "KYC vérifié",
      value: promoteur?.kycStatus === "verified" ? 1 : 0,
      max: 1,
      icon: ShieldCheck,
      status: promoteur?.kycStatus === "verified" ? "excellent" : "needs-improvement",
    },
    {
      label: "Statut conformité",
      value: promoteur?.complianceStatus === "verifie" ? 1 : promoteur?.complianceStatus === "conforme" ? 0.5 : 0,
      max: 1,
      icon: Award,
      status: promoteur?.complianceStatus === "verifie" ? "excellent" : promoteur?.complianceStatus === "conforme" ? "good" : "needs-improvement",
    },
  ];

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return "—";
    }
  };

  return (
    <Card className={cn("border-2", scoreInfo.border, className)}>
      <CardHeader className={cn("pb-3", scoreInfo.bg)}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <ShieldCheck className={cn("w-5 h-5", scoreInfo.color)} />
              Score de Confiance
            </CardTitle>
            {promoteur?.organizationName && (
              <p className="text-sm text-slate-600 mt-1">{promoteur.organizationName}</p>
            )}
          </div>
          <Badge variant="outline" className={cn("text-base font-bold px-3 py-1", scoreInfo.color)}>
            {trustScore}/100
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 pt-4">
        {/* Barre de progression */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Niveau de confiance</span>
            <span className={cn("font-semibold", scoreInfo.color)}>{scoreInfo.label}</span>
          </div>
          <Progress value={trustScore} className="h-3" />
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>0</span>
            <span>50</span>
            <span>70</span>
            <span>85</span>
            <span>100</span>
          </div>
        </div>

        {/* Score promoteur si différent */}
        {promoteurScore > 0 && promoteurScore !== trustScore && (
          <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
            <span className="text-sm text-slate-600">Score promoteur</span>
            <span className="text-sm font-semibold text-slate-900">{promoteurScore}/100</span>
          </div>
        )}

        {/* Badges */}
        {badges.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Award className="w-4 h-4 text-amber-500" />
              Badges obtenus ({badges.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {badges.slice(0, 5).map((badge: any, idx: number) => {
                const badgeData = typeof badge.badgeId === "object" ? badge.badgeId : null;
                const badgeName = badgeData?.name || `Badge ${idx + 1}`;
                return (
                  <Badge
                    key={badge._id || idx}
                    variant="secondary"
                    className="text-xs flex items-center gap-1"
                  >
                    <Award className="w-3 h-3" />
                    {badgeName}
                  </Badge>
                );
              })}
              {badges.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{badges.length - 5} autres
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Facteurs de transparence */}
        <div className="space-y-2 pt-2 border-t">
          <h4 className="text-sm font-medium text-slate-700">Facteurs de transparence</h4>
          <div className="space-y-2">
            {transparencyFactors.map((factor, idx) => {
              const Icon = factor.icon;
              const isComplete = factor.value >= factor.max * 0.8;
              const statusIcon =
                factor.status === "excellent" ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : factor.status === "good" ? (
                  <Clock className="w-4 h-4 text-blue-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                );

              return (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-600">{factor.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {factor.max > 1 ? (
                      <span className="text-slate-500 text-xs">
                        {factor.value}/{factor.max}
                      </span>
                    ) : (
                      statusIcon
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dernière mise à jour */}
        {lastUpdateDate && (
          <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t">
            <Calendar className="w-3 h-3" />
            <span>Dernière mise à jour: {formatDate(lastUpdateDate)}</span>
          </div>
        )}

        {/* Suggestions d'amélioration */}
        {trustScore < 70 && (
          <div className={cn("p-3 rounded-lg text-sm", scoreInfo.bg)}>
            <div className="flex items-start gap-2">
              <TrendingUp className={cn("w-4 h-4 mt-0.5", scoreInfo.color)} />
              <div className="flex-1">
                <p className={cn("font-medium mb-1", scoreInfo.color)}>Suggestions d'amélioration</p>
                <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                  {documentsCount < 5 && <li>Ajouter plus de documents publics ({documentsCount}/5 minimum)</li>}
                  {updatesCount < 10 && <li>Publier des mises à jour régulières ({updatesCount}/10 recommandé)</li>}
                  {promoteur?.kycStatus !== "verified" && <li>Compléter la vérification KYC</li>}
                  {promoteur?.complianceStatus !== "verifie" && <li>Demander le statut "Vérifié"</li>}
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
