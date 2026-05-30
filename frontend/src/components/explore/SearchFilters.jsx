import { useMemo, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, ChevronDown, LayoutGrid, MapPin, Search, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/useUIStore";
import { fetchCategories } from "@/services/categories";
import { fetchTags } from "@/services/tags";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export default function SearchFilters({
  category,
  onCategoryChange,
  sortBy,
  onSortByChange,
  tags,
  onTagsChange,
}) {
  const { t } = useTranslation();
  const { exploreViewMode, setExploreViewMode } = useUIStore();
  const [tagSearch, setTagSearch] = useState("");
  const selectedTags = useMemo(
    () => tags ? tags.split(",").filter(Boolean) : [],
    [tags],
  );

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const { data: tagOptions = [] } = useQuery({
    queryKey: ["tags", category],
    queryFn: () => fetchTags({ category }),
  });

  const selectedTagOptions = useMemo(
    () => tagOptions.filter(tag => selectedTags.includes(String(tag.id))),
    [selectedTags, tagOptions],
  );

  const filteredTagOptions = useMemo(() => {
    const search = tagSearch.trim().toLowerCase();

    if (!search) return tagOptions;

    return tagOptions.filter(tag => tag.name.toLowerCase().includes(search));
  }, [tagOptions, tagSearch]);

  const toggleTag = tagId => {
    const nextTags = selectedTags.includes(tagId)
      ? selectedTags.filter(id => id !== tagId)
      : [...selectedTags, tagId];

    onTagsChange(nextTags.join(","));
  };

  return (
    <div className="fixed top-16 z-40 border-b w-full border-stone-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
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

          <div className="flex min-w-0 flex-1 items-center gap-2">
            <DropdownMenu.Root onOpenChange={open => !open && setTagSearch("")}>
              <DropdownMenu.Trigger asChild>
                <Button type="button" variant="outline" className="shrink-0 px-4 rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0">
                  <Tag className="h-4 w-4" />
                  {t("filters.tags")}
                  {selectedTags.length > 0 && (
                    <span className="rounded-full bg-primary-600 px-2 py-0.5 text-xs text-white">
                      {selectedTags.length}
                    </span>
                  )}
                  <ChevronDown className="h-4 w-4 text-stone-400" />
                </Button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="start"
                  sideOffset={8}
                  className="z-50 w-[min(92vw,420px)] rounded-xl border border-stone-200 bg-white p-3 shadow-xl"
                >
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                    <Input
                      value={tagSearch}
                      onChange={event => setTagSearch(event.target.value)}
                      placeholder={t("filters.searchTags")}
                      className="h-9 pl-9"
                    />
                  </div>

                  <div className="mt-3 grid max-h-72 gap-1 overflow-y-auto pr-1 sm:grid-cols-2">
                    {filteredTagOptions.map(tag => {
                      const tagId = String(tag.id);
                      const isSelected = selectedTags.includes(tagId);

                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => toggleTag(tagId)}
                          className={cn(
                            "flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                            isSelected
                              ? "bg-primary-50 text-primary-900"
                              : "text-stone-700 hover:bg-stone-50",
                          )}
                        >
                          <span
                            className={cn(
                              "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                              isSelected
                                ? "border-primary-600 bg-primary-600 text-white"
                                : "border-stone-300",
                            )}
                          >
                            {isSelected && <Check className="h-3 w-3" />}
                          </span>
                          <span className="min-w-0 truncate">{tag.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-3">
                    <span className="text-xs text-stone-500">
                      {selectedTags.length} {t("filters.selectedTags")}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => onTagsChange("")}
                      disabled={selectedTags.length === 0}
                      className="px-3"
                    >
                      {t("filters.clearTags")}
                    </Button>
                  </div>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>

            
          </div>

          <div className="ml-auto flex shrink-0 rounded-xl border border-stone-200 p-1">
            <button
              title={t("filters.gridView")}
              type="button"
              onClick={() => setExploreViewMode("grid")}
              className={cn(
                "rounded-lg py-2 px-4 transition-colors",
                exploreViewMode === "grid"
                  ? "bg-primary-600 text-white"
                  : "text-stone-500 hover:bg-stone-50",
              )}
              aria-label={t("filters.gridView")}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              title={t("filters.mapView")}
              type="button"
              onClick={() => setExploreViewMode("map")}
              className={cn(
                "rounded-lg py-2 px-4 transition-colors",
                exploreViewMode === "map"
                  ? "bg-primary-600 text-white"
                  : "text-stone-500 hover:bg-stone-50",
              )}
              aria-label={t("filters.mapView")}
            >
              <MapPin className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
