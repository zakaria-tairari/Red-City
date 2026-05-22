import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fetchPlaces } from "@/services/places";
import SearchFilters from "@/components/explore/SearchFilters";
import ExploreListItem from "@/components/explore/ExploreListItem";
import { PlaceCard } from "@/components/ui/PlaceCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import PlacesMap from "@/components/map/PlacesMap";
import { useDebounce } from "@/hooks/useDebounce";
import { useUIStore } from "@/store/useUIStore";

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { exploreViewMode } = useUIStore();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "name");

  const debouncedQuery = useDebounce(query, 400);

  const { data: places, isLoading, isFetching } = useQuery({
    queryKey: ["places", debouncedQuery, category, sortBy],
    queryFn: () =>
      fetchPlaces({
        query: debouncedQuery,
        category,
        sortBy,
      }),
    placeholderData: keepPreviousData,
  });

  const updateFilters = updates => {
    const params = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    
    setSearchParams(params);
  };

  return (
    <motion.div className="min-h-screen pt-16">
      <SearchFilters
        query={query}
        onQueryChange={v => {
          setQuery(v);
          updateFilters({ q: v });
        }}
        category={category}
        onCategoryChange={v => {
          setCategory(v);
          updateFilters({ category: v });
        }}
        sortBy={sortBy}
        onSortByChange={v => {
          setSortBy(v);
          updateFilters({ sort: v });
        }}
      />

      <div className="mx-auto">
        {exploreViewMode === "map" ? (
          <div className="flex mt-18">

            <div className="w-110 px-5 pt-6 border-r border-stone-200">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-stone-500">
                  {isLoading
                    ? "Searching..."
                    : `${places?.total ?? 0} places found`}
                  {isFetching && !isLoading && " · Updating..."}
                </p>
              </div>

              <div className="h-[calc(100vh-200px)] overflow-y-auto scrollbar-hide">
                <div className="pb-20 space-y-3 pr-2">
                  {isLoading
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-28 w-full rounded-xl" />
                      ))
                    : places?.map(place => (
                        <ExploreListItem key={place.id} place={place} />
                      ))}
                </div>
              </div>
            </div>

            <div className="flex-1">
              <PlacesMap
                places={places ?? []}
                className="w-full h-full"
              />
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto mt-23 pb-12">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-stone-500">
                {isLoading
                  ? "Searching..."
                  : `${places?.total ?? 0} places found`}
                {isFetching && !isLoading && " · Updating..."}
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton
                      key={i}
                      className="aspect-4/3 w-full rounded-2xl"
                    />
                  ))
                : places?.map((place, i) => (
                    <motion.div
                      key={place.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <PlaceCard place={place} />
                    </motion.div>
                  ))}
            </div>
          </div>
        )}

        {!isLoading && places?.length === 0 && (
          <div className="py-20 text-center">
            <p className="font-serif text-xl text-stone-600">No places found</p>
            <p className="mt-2 text-stone-400">
              Try adjusting your filters or search term.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
