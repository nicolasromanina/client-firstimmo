import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, X, Check } from "lucide-react";
import type { ProjectSearchParams } from "@/lib/services";
import { cn } from "@/lib/utils";
import { convertFilterPriceToBackend, convertBackendPriceToFilter } from "@/lib/currency";

interface ProjectSearchFiltersProps {
  params: ProjectSearchParams;
  onChange: (params: ProjectSearchParams) => void;
  resultCount?: number;
  className?: string;
}

const SORT_OPTIONS: { value: ProjectSearchParams["sort"]; label: string }[] = [
  { value: "score", label: "Score de confiance" },
  { value: "recent", label: "Plus récents" },
  { value: "price_asc", label: "Prix croissant" },
  { value: "price_desc", label: "Prix décroissant" },
  { value: "delivery", label: "Livraison" },
];

export function ProjectSearchFilters({
  params,
  onChange,
  resultCount,
  className,
}: ProjectSearchFiltersProps) {
  const [searchInput, setSearchInput] = useState(params.search ?? "");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    country: params.country ?? "",
    city: params.city ?? "",
    projectType: params.projectType ?? ("" as "" | "villa" | "immeuble"),
    minPrice: params.minPrice ?? "",
    maxPrice: params.maxPrice ?? "",
    minScore: params.minScore ?? "",
    deliveryBefore: params.deliveryBefore ?? "",
    verifiedOnly: params.verifiedOnly ?? false,
  });

  const applySearch = () => {
    onChange({
      ...params,
      search: searchInput.trim() || undefined,
      page: 1,
    });
  };

  const applyFilters = () => {
    // Convertir les prix EUR saisis par l'utilisateur vers la devise backend si nécessaire
    // Note: Le backend attend probablement les prix dans sa devise native
    // Pour l'instant, on envoie en EUR et le backend gère la conversion si besoin
    onChange({
      ...params,
      country: localFilters.country || undefined,
      city: localFilters.city || undefined,
      projectType: localFilters.projectType || undefined,
      minPrice: localFilters.minPrice ? Number(localFilters.minPrice) : undefined,
      maxPrice: localFilters.maxPrice ? Number(localFilters.maxPrice) : undefined,
      minScore: localFilters.minScore ? Number(localFilters.minScore) : undefined,
      deliveryBefore: localFilters.deliveryBefore || undefined,
      verifiedOnly: localFilters.verifiedOnly || undefined,
      page: 1,
    });
  };

  const clearFilters = () => {
    setSearchInput("");
    setLocalFilters({
      country: "",
      city: "",
      projectType: "",
      minPrice: "",
      maxPrice: "",
      minScore: "",
      deliveryBefore: "",
      verifiedOnly: false,
    });
    onChange({
      page: 1,
      limit: params.limit ?? 20,
    });
  };

  const hasActiveFilters =
    params.search ||
    params.country ||
    params.city ||
    params.projectType ||
    params.minPrice != null ||
    params.maxPrice != null ||
    params.minScore != null ||
    params.deliveryBefore ||
    params.verifiedOnly;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Search className="w-5 h-5" />
          Recherche et filtres
        </CardTitle>
        {resultCount != null && (
          <p className="text-sm text-muted-foreground">
            {resultCount} projet{resultCount !== 1 ? "s" : ""} trouvé{resultCount !== 1 ? "s" : ""}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Barre de recherche */}
        <div className="flex gap-2">
          <Input
            placeholder="Pays, ville, quartier, mot-clé..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applySearch()}
            className="flex-1"
          />
          <Button onClick={applySearch} size="default">
            Rechercher
          </Button>
        </div>

        {/* Tri */}
        <div className="flex flex-wrap items-center gap-2">
          <Label className="text-sm text-muted-foreground whitespace-nowrap">Trier par :</Label>
          <Select
            value={params.sort ?? "score"}
            onValueChange={(value) =>
              onChange({ ...params, sort: value as ProjectSearchParams["sort"], page: 1 })
            }
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <label className="flex items-center gap-2 cursor-pointer ml-4">
            <input
              type="checkbox"
              checked={localFilters.verifiedOnly}
              onChange={(e) => {
                const checked = e.target.checked;
                setLocalFilters((p) => ({ ...p, verifiedOnly: checked }));
                onChange({ ...params, verifiedOnly: checked || undefined, page: 1 });
              }}
              className="rounded border-gray-300"
            />
            <span className="text-sm">Vérifiés uniquement</span>
          </label>
        </div>

        {/* Filtres avancés */}
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="mb-2"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filtres avancés
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                actifs
              </Badge>
            )}
          </Button>

          {showAdvanced && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/30">
              <div>
                <Label className="text-xs">Pays</Label>
                <Input
                  placeholder="Ex: Sénégal"
                  value={localFilters.country}
                  onChange={(e) =>
                    setLocalFilters((p) => ({ ...p, country: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Ville</Label>
                <Input
                  placeholder="Ex: Dakar"
                  value={localFilters.city}
                  onChange={(e) =>
                    setLocalFilters((p) => ({ ...p, city: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Type de projet</Label>
                <Select
                  value={localFilters.projectType || "all"}
                  onValueChange={(v) =>
                    setLocalFilters((p) => ({
                      ...p,
                      projectType: v === "all" ? "" : (v as "villa" | "immeuble"),
                    }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Tous" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="immeuble">Immeuble</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Budget min (€)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={localFilters.minPrice}
                  onChange={(e) =>
                    setLocalFilters((p) => ({ ...p, minPrice: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Budget max (€)</Label>
                <Input
                  type="number"
                  placeholder="500000"
                  value={localFilters.maxPrice}
                  onChange={(e) =>
                    setLocalFilters((p) => ({ ...p, maxPrice: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Score min (0-100)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="50"
                  value={localFilters.minScore}
                  onChange={(e) =>
                    setLocalFilters((p) => ({ ...p, minScore: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs">Livraison avant le</Label>
                <Input
                  type="date"
                  value={localFilters.deliveryBefore}
                  onChange={(e) =>
                    setLocalFilters((p) => ({
                      ...p,
                      deliveryBefore: e.target.value || "",
                    }))
                  }
                  className="mt-1"
                />
              </div>
              <div className="flex items-end gap-2">
                <Button size="sm" onClick={applyFilters}>
                  <Check className="w-4 h-4 mr-1" />
                  Appliquer
                </Button>
                <Button size="sm" variant="outline" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-1" />
                  Réinitialiser
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
