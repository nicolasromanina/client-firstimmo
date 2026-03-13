import { useEffect, useMemo, useRef, useState } from "react";
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
import { SlidersHorizontal, X, Check, Sparkles } from "lucide-react";
import { projectService } from "@/lib/services";
import type { ProjectSearchParams } from "@/lib/services";
import { cn } from "@/lib/utils";

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
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const blurTimeoutRef = useRef<number | null>(null);
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
  const [priceError, setPriceError] = useState("");

  useEffect(() => {
    setSearchInput(params.search ?? "");
    setLocalFilters({
      country: params.country ?? "",
      city: params.city ?? "",
      projectType: params.projectType ?? ("" as "" | "villa" | "immeuble"),
      minPrice: params.minPrice ?? "",
      maxPrice: params.maxPrice ?? "",
      minScore: params.minScore ?? "",
      deliveryBefore: params.deliveryBefore ?? "",
      verifiedOnly: params.verifiedOnly ?? false,
    });
  }, [params]);

  const applySearch = () => {
    onChange({
      ...params,
      search: searchInput.trim() || undefined,
      page: 1,
    });
    setShowSuggestions(false);
    setShowAdvanced(false);
  };

  const applyFilters = () => {
    const minValue = localFilters.minPrice ? Number(localFilters.minPrice) : undefined;
    const maxValue = localFilters.maxPrice ? Number(localFilters.maxPrice) : undefined;
    if (
      minValue != null &&
      maxValue != null &&
      !Number.isNaN(minValue) &&
      !Number.isNaN(maxValue) &&
      minValue > maxValue
    ) {
      setPriceError("Le budget minimum ne peut pas etre superieur au budget maximum.");
      return;
    }
    setPriceError("");
    onChange({
      ...params,
      country: localFilters.country || undefined,
      city: localFilters.city || undefined,
      projectType: localFilters.projectType || undefined,
      minPrice: minValue,
      maxPrice: maxValue,
      minScore: localFilters.minScore ? Number(localFilters.minScore) : undefined,
      deliveryBefore: localFilters.deliveryBefore || undefined,
      verifiedOnly: localFilters.verifiedOnly || undefined,
      page: 1,
    });
    setShowAdvanced(false);
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
    setShowAdvanced(false);
    setShowSuggestions(false);
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

  const activeFilterBadges = useMemo(() => {
    const badges: Array<{ key: string; label: string }> = [];
    if (params.search) badges.push({ key: "search", label: `Recherche: ${params.search}` });
    if (params.country) badges.push({ key: "country", label: `Pays: ${params.country}` });
    if (params.city) badges.push({ key: "city", label: `Ville: ${params.city}` });
    if (params.projectType) {
      badges.push({
        key: "projectType",
        label: `Type: ${params.projectType === "villa" ? "Villa" : "Immeuble"}`,
      });
    }
    if (params.minPrice != null) badges.push({ key: "minPrice", label: `Min: ${params.minPrice.toLocaleString("fr-FR")} EUR` });
    if (params.maxPrice != null) badges.push({ key: "maxPrice", label: `Max: ${params.maxPrice.toLocaleString("fr-FR")} EUR` });
    if (params.minScore != null) badges.push({ key: "minScore", label: `Score >= ${params.minScore}` });
    if (params.deliveryBefore) badges.push({ key: "deliveryBefore", label: `Livraison: ${params.deliveryBefore}` });
    if (params.verifiedOnly) badges.push({ key: "verifiedOnly", label: "Verifies uniquement" });
    return badges;
  }, [params]);

  const removeFilter = (key: string) => {
    const next: ProjectSearchParams = { ...params, page: 1 };
    if (key === "search") {
      delete next.search;
      setSearchInput("");
    } else if (key === "country") {
      delete next.country;
      setLocalFilters((p) => ({ ...p, country: "" }));
    } else if (key === "city") {
      delete next.city;
      setLocalFilters((p) => ({ ...p, city: "" }));
    } else if (key === "projectType") {
      delete next.projectType;
      setLocalFilters((p) => ({ ...p, projectType: "" }));
    } else if (key === "minPrice") {
      delete next.minPrice;
      setLocalFilters((p) => ({ ...p, minPrice: "" }));
    } else if (key === "maxPrice") {
      delete next.maxPrice;
      setLocalFilters((p) => ({ ...p, maxPrice: "" }));
    } else if (key === "minScore") {
      delete next.minScore;
      setLocalFilters((p) => ({ ...p, minScore: "" }));
    } else if (key === "deliveryBefore") {
      delete next.deliveryBefore;
      setLocalFilters((p) => ({ ...p, deliveryBefore: "" }));
    } else if (key === "verifiedOnly") {
      delete next.verifiedOnly;
      setLocalFilters((p) => ({ ...p, verifiedOnly: false }));
    }
    onChange(next);
  };

  useEffect(() => {
    if (blurTimeoutRef.current) {
      window.clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }

    const term = searchInput.trim();
    if (term.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSuggesting(true);
    const handle = window.setTimeout(async () => {
      try {
        const result = await projectService.searchProjects({ search: term, limit: 6, page: 1 });
        const projects = result.projects || [];
        const bucket: string[] = [];
        const add = (value?: string) => {
          if (!value) return;
          const trimmed = value.trim();
          if (!trimmed) return;
          if (!bucket.some((item) => item.toLowerCase() === trimmed.toLowerCase())) {
            bucket.push(trimmed);
          }
        };
        projects.forEach((p: any) => {
          add(p.title || p.name);
          add(p.city);
          add(p.area);
          add(p.location?.city);
          add(p.country);
        });
        setSuggestions(bucket.slice(0, 6));
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsSuggesting(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(handle);
    };
  }, [searchInput]);

  return (
    <Card className={cn("w-full border-slate-200 bg-gradient-to-b from-white to-slate-50/40 text-slate-900 shadow-sm dark:border-slate-200 dark:bg-white dark:text-slate-900", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-slate-900">
          <Sparkles className="w-5 h-5 text-amber-500" />
          Recherche et filtres
        </CardTitle>
        {resultCount != null && (
          <p className="text-sm text-slate-600">
            {resultCount} projet{resultCount !== 1 ? "s" : ""} trouvé{resultCount !== 1 ? "s" : ""}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Barre de recherche */}
        <div className="flex gap-2 relative">
          <div className="flex-1 relative">
            <Input
              placeholder="Pays, ville, quartier, mot-clé..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applySearch()}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => {
                blurTimeoutRef.current = window.setTimeout(() => setShowSuggestions(false), 150);
              }}
              className="w-full bg-white text-slate-900 border-slate-200 dark:bg-white dark:text-slate-900 dark:border-slate-200"
            />
            {showSuggestions && (suggestions.length > 0 || isSuggesting) && (
              <div className="absolute z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                {isSuggesting ? (
                  <div className="px-4 py-3 text-sm text-slate-500">Recherche en cours...</div>
                ) : (
                  suggestions.map((item) => (
                    <button
                      type="button"
                      key={item}
                      onMouseDown={() => {
                        setSearchInput(item);
                        setShowSuggestions(false);
                        onChange({ ...params, search: item, page: 1 });
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      {item}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          <Button onClick={applySearch} size="default">
            Rechercher
          </Button>
        </div>

        {/* Tri */}
        <div className="flex flex-wrap items-center gap-2">
          <Label className="text-sm text-slate-600 whitespace-nowrap">Trier par :</Label>
          <Select
            value={params.sort ?? "score"}
            onValueChange={(value) =>
              onChange({ ...params, sort: value as ProjectSearchParams["sort"], page: 1 })
            }
          >
            <SelectTrigger className="w-[200px] bg-white text-slate-900 border-slate-200 dark:bg-white dark:text-slate-900 dark:border-slate-200 [&>span]:text-slate-900">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white text-slate-900 border-slate-200 shadow-lg">
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-slate-900 focus:bg-slate-100 focus:text-slate-900">
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
            <span className="text-sm text-slate-700">Vérifiés uniquement</span>
          </label>
        </div>

        {activeFilterBadges.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {activeFilterBadges.map((badge) => (
              <span
                key={badge.key}
                className="inline-flex items-center gap-1 rounded-full bg-slate-900 text-white text-xs px-3 py-1"
              >
                {badge.label}
                <button
                  type="button"
                  onClick={() => removeFilter(badge.key)}
                  className="rounded-full hover:bg-white/20 p-0.5"
                  aria-label={`Retirer le filtre ${badge.label}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Filtres avancés */}
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="mb-2 bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border border-slate-200 rounded-lg bg-slate-50 dark:bg-slate-50 dark:border-slate-200">
              <div>
                <Label className="text-xs text-slate-700">Pays</Label>
                <Input
                  placeholder="Ex: Sénégal"
                  value={localFilters.country}
                  onChange={(e) =>
                    setLocalFilters((p) => ({ ...p, country: e.target.value }))
                  }
                  className="mt-1 bg-white text-slate-900 border-slate-200 dark:bg-white dark:text-slate-900 dark:border-slate-200 [&>span]:text-slate-900"
                />
              </div>
              <div>
                <Label className="text-xs text-slate-700">Ville</Label>
                <Input
                  placeholder="Ex: Dakar"
                  value={localFilters.city}
                  onChange={(e) =>
                    setLocalFilters((p) => ({ ...p, city: e.target.value }))
                  }
                  className="mt-1 bg-white text-slate-900 border-slate-200 dark:bg-white dark:text-slate-900 dark:border-slate-200 [&>span]:text-slate-900"
                />
              </div>
              <div>
                <Label className="text-xs text-slate-700">Type de projet</Label>
                <Select
                  value={localFilters.projectType || "all"}
                  onValueChange={(v) =>
                    setLocalFilters((p) => ({
                      ...p,
                      projectType: v === "all" ? "" : (v as "villa" | "immeuble"),
                    }))
                  }
                >
                  <SelectTrigger className="mt-1 bg-white text-slate-900 border-slate-200 dark:bg-white dark:text-slate-900 dark:border-slate-200 [&>span]:text-slate-900">
                    <SelectValue placeholder="Tous" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-slate-900 border-slate-200 shadow-lg">
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="immeuble">Immeuble</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-slate-700">Budget min (€)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={localFilters.minPrice}
                  onChange={(e) =>
                    setLocalFilters((p) => ({ ...p, minPrice: e.target.value }))
                  }
                  className="mt-1 bg-white text-slate-900 border-slate-200 dark:bg-white dark:text-slate-900 dark:border-slate-200 [&>span]:text-slate-900"
                />
              </div>
              <div>
                <Label className="text-xs text-slate-700">Budget max (€)</Label>
                <Input
                  type="number"
                  placeholder="500000"
                  value={localFilters.maxPrice}
                  onChange={(e) =>
                    setLocalFilters((p) => ({ ...p, maxPrice: e.target.value }))
                  }
                  className="mt-1 bg-white text-slate-900 border-slate-200 dark:bg-white dark:text-slate-900 dark:border-slate-200 [&>span]:text-slate-900"
                />
              </div>
              <div>
                <Label className="text-xs text-slate-700">Score min (0-100)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="50"
                  value={localFilters.minScore}
                  onChange={(e) =>
                    setLocalFilters((p) => ({ ...p, minScore: e.target.value }))
                  }
                  className="mt-1 bg-white text-slate-900 border-slate-200 dark:bg-white dark:text-slate-900 dark:border-slate-200 [&>span]:text-slate-900"
                />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs text-slate-700">Livraison avant le</Label>
                <Input
                  type="date"
                  value={localFilters.deliveryBefore}
                  onChange={(e) =>
                    setLocalFilters((p) => ({
                      ...p,
                      deliveryBefore: e.target.value || "",
                    }))
                  }
                  className="mt-1 bg-white text-slate-900 border-slate-200 dark:bg-white dark:text-slate-900 dark:border-slate-200 [&>span]:text-slate-900"
                />
              </div>
              <div className="flex items-end gap-2">
                <Button size="sm" onClick={applyFilters}>
                  <Check className="w-4 h-4 mr-1" />
                  Appliquer
                </Button>
                <Button size="sm" variant="outline" onClick={clearFilters} className="bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900">
                  <X className="w-4 h-4 mr-1" />
                  Réinitialiser
                </Button>
              </div>
              {priceError && (
                <p className="text-xs text-red-600 sm:col-span-2 lg:col-span-3">{priceError}</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}




