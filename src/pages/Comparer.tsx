import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Plus, Trash2, BarChart3 } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSearchProjects } from "@/hooks/useApi";
import { useCreateComparison } from "@/hooks/useApi";
import { useToast } from "@/components/ui/use-toast";
import { formatPrice } from "@/lib/currency";
import { cn } from "@/lib/utils";

const MIN_PROJECTS = 2;
const MAX_PROJECTS = 3;

export default function Comparer() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [notes, setNotes] = useState("");

  const { data: searchResult, isLoading: searching } = useSearchProjects({
    search: searchTerm || undefined,
    limit: 15,
  });
  const projects = searchResult?.projects ?? [];
  const createComparison = useCreateComparison();

  const toggleProject = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_PROJECTS) return prev;
      return [...prev, id];
    });
  };

  const selectedProjects = selectedIds
    .map((id) => projects.find((p) => p._id === id))
    .filter(Boolean) as any[];

  const canCreate = selectedIds.length >= MIN_PROJECTS && selectedIds.length <= MAX_PROJECTS;

  const handleCreate = async () => {
    if (!canCreate) return;
    try {
      const comparison = await createComparison.mutateAsync({
        projectIds: selectedIds,
        notes: notes.trim() || undefined,
      });
      toast({ title: "Comparaison créée", description: "Redirection vers la vue détaillée." });
      navigate(`/comparaisons/${comparison._id}`);
    } catch (e: any) {
      toast({
        title: "Erreur",
        description: e?.message || "Impossible de créer la comparaison",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-sky-500 dark:text-sky-400" />
            Comparer des projets
          </h1>
          <Link to="/projets">
            <Button variant="outline">Retour aux projets</Button>
          </Link>
        </div>

        <Card className="border-slate-200 dark:border-slate-800 dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-lg text-slate-900 dark:text-slate-100">Sélectionnez 2 ou 3 projets</CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-300">
              Recherchez des projets puis ajoutez-les à la comparaison. Vous pouvez comparer au maximum 3 projets.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="text"
              placeholder="Rechercher par titre, ville, pays..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:border-slate-800"
            />

            {selectedIds.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Sélectionnés:</span>
                {selectedProjects.map((p) => (
                  <Badge
                    key={p._id}
                    variant="secondary"
                    className="flex items-center gap-1 pr-1 dark:bg-slate-800 dark:text-slate-100"
                  >
                    {p.title}
                    <button
                      type="button"
                      onClick={() => toggleProject(p._id)}
                      className="ml-1 p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                      aria-label="Retirer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  ({selectedIds.length}/{MAX_PROJECTS})
                </span>
              </div>
            )}

            <div className="border rounded-lg divide-y max-h-80 overflow-y-auto border-slate-200 dark:border-slate-800 dark:divide-slate-800">
              {searching ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
                </div>
              ) : projects.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-sm dark:text-slate-400">
                  {searchTerm ? "Aucun projet trouvé. Modifiez la recherche." : "Saisissez une recherche pour afficher des projets."}
                </div>
              ) : (
                projects.map((p) => {
                  const selected = selectedIds.includes(p._id);
                  const disabled = !selected && selectedIds.length >= MAX_PROJECTS;
                  return (
                    <div
                      key={p._id}
                      className={cn(
                        "group flex items-center justify-between p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60",
                        selected && "bg-sky-50 dark:bg-slate-800"
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 dark:text-slate-100 truncate">{p.title}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {p.area || p.city || "—"} · {formatPrice(p.priceFrom, p.currency).display}
                          {p.trustScore != null && ` · Score ${p.trustScore}`}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant={selected ? "secondary" : "outline"}
                        size="sm"
                        disabled={disabled}
                        onClick={() => toggleProject(p._id)}
                      >
                        {selected ? "Retirer" : <Plus className="w-4 h-4" />}
                      </Button>
                    </div>
                  );
                })
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">Note (optionnel)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ajouter une note pour cette comparaison..."
                rows={2}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:border-slate-800"
              />
            </div>

            <Button
              onClick={handleCreate}
              disabled={!canCreate || createComparison.isPending}
              className="w-full sm:w-auto"
            >
              {createComparison.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Comparer les {selectedIds.length} projets
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}



