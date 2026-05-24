import { useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { fetchPlaces } from "@/services/places";
import SearchFilters from "@/components/explore/SearchFilters";
import ExploreListItem from "@/components/explore/ExploreListItem";
import { PlaceCard } from "@/components/ui/PlaceCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import PlacesMap from "@/components/map/PlacesMap";
import { useDebounce } from "@/hooks/useDebounce";
import { useUIStore } from "@/store/useUIStore";
import { useState } from "react";

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { exploreViewMode } = useUIStore();
  const loadMoreRef = useRef(null);

  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const sortBy = searchParams.get("sort") || "name";

  const debouncedQuery = useDebounce(query, 400);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["places", debouncedQuery, category, sortBy],
    queryFn: ({ pageParam = 1 }) =>
      fetchPlaces({ query: debouncedQuery, category, sortBy, limit: 16, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: lastPage =>
      lastPage.current_page < lastPage.last_page
        ? lastPage.current_page + 1
        : undefined,
  });

  const allPlaces = data?.pages.flatMap(page => page.items) ?? [];
  const total = data?.pages[0]?.total ?? 0;
  const currentPagePlaces = data?.pages[data.pages.length - 1]?.items ?? [];

  const updateFilters = updates => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    setSearchParams(params, { replace: true, preventScrollReset: true });
  };

  const handleLoadMore = () => {
    fetchNextPage().then(() => {
      if (loadMoreRef.current) {
        loadMoreRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  };

  return (
    <motion.div className="min-h-screen pt-16">
      <SearchFilters
        query={query}
        onQueryChange={v => updateFilters({ q: v })}
        category={category}
        onCategoryChange={v => updateFilters({ category: v })}
        sortBy={sortBy}
        onSortByChange={v => updateFilters({ sort: v })}
      />

      <div className="mx-auto">
        {exploreViewMode === "map" ? (
          <div className="flex mt-18">
            <div className="w-110 px-5 pt-6 border-r border-stone-200">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-stone-500">
                  {isLoading ? "Searching..." : `${total} places found`}
                  {isFetchingNextPage && " · Loading more..."}
                </p>
              </div>

              <div className="h-[calc(100vh-190px)] overflow-y-auto scrollbar-hide">
                <div className="space-y-3 pr-2">
                  {isLoading
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-28 w-full rounded-xl" />
                      ))
                    : allPlaces.map(place => (
                        <ExploreListItem key={place.id} place={place} />
                      ))
                  }
                  {hasNextPage && (
                    <div ref={loadMoreRef} className="flex col-span-full justify-center pt-8 pb-12">
                      <Button
                        variant="default"
                        onClick={handleLoadMore}
                        disabled={isFetchingNextPage}
                      >
                        {isFetchingNextPage ? "Loading..." : "Load more"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1">
              <PlacesMap places={allPlaces} className="w-full h-full" />
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto mt-23">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-stone-500">
                {isLoading ? "Searching..." : `${total} places found`}
                {isFetchingNextPage && " · Loading more..."}
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-4/3 w-full rounded-2xl" />
                  ))
                : allPlaces.map((place, i) => (
                    <motion.div
                      key={place.id}
                      initial={i >= allPlaces.length - currentPagePlaces.length
                        ? { opacity: 0, y: 16 }
                        : false}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (i % 12) * 0.04 }}
                    >
                      <PlaceCard place={place} />
                    </motion.div>
                  ))
              }
              {hasNextPage && (
                <div ref={loadMoreRef} className="flex col-span-full justify-center pt-8">
                  <Button
                    variant="default"
                    onClick={handleLoadMore}
                    disabled={isFetchingNextPage}
                  >
                    {isFetchingNextPage ? "Loading..." : "Load more"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {!isLoading && allPlaces.length === 0 && (
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