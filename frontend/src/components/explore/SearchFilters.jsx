import { LayoutGrid, MapPin, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { CATEGORIES } from "@/data/categories";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/useUIStore";
import { fetchCategories } from "@/services/categories";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export default function SearchFilters({
  category,
  onCategoryChange,
  sortBy,
  onSortByChange,
}) {
  const { t } = useTranslation();
  const { exploreViewMode, setExploreViewMode } = useUIStore();

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  return (
    <div className="fixed top-16 z-40 border-b w-full border-stone-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Select
            value={category || "all"}
            onValueChange={v => onCategoryChange(v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-50">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{ t("filters.allCategories") }</SelectItem>
              {categories?.map(c => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {t(`categories.${c.code}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={onSortByChange}>
            <SelectTrigger className="w-45">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">{ t("filters.rating") }</SelectItem>
              <SelectItem value="reviews">{ t("filters.reviews") }</SelectItem>
              <SelectItem value="name">{ t("filters.name") }</SelectItem>
            </SelectContent>
          </Select>

          <div className="ml-auto flex rounded-xl border border-stone-200 p-1">
            <button
              title="Grid view"
              type="button"
              onClick={() => setExploreViewMode("grid")}
              className={cn(
                "rounded-lg py-2 px-4 transition-colors",
                exploreViewMode === "grid"
                  ? "bg-primary-600 text-white"
                  : "text-stone-500 hover:bg-stone-50",
              )}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              title="Map view"
              type="button"
              onClick={() => setExploreViewMode("map")}
              className={cn(
                "rounded-lg py-2 px-4 transition-colors",
                exploreViewMode === "map"
                  ? "bg-primary-600 text-white"
                  : "text-stone-500 hover:bg-stone-50",
              )}
              aria-label="Map view"
            >
              <MapPin className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
