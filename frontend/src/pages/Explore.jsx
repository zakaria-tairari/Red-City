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
import { useUIStore } from "@/store/useUIStore";
import { useTranslation } from "react-i18next";

export default function Explore() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { exploreViewMode } = useUIStore();
  const loadMoreRef = useRef(null);

  const category = searchParams.get("category") || "";
  const sortBy = searchParams.get("sort") || "rating";
  const tags = searchParams.get("tags") || "";

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["places", category, sortBy, tags],
    queryFn: ({ pageParam = 1 }) =>
      fetchPlaces({ category, sortBy, tags, limit: 16, page: pageParam }),
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
        category={category}
        onCategoryChange={v => updateFilters({ category: v })}
        sortBy={sortBy}
        onSortByChange={v => updateFilters({ sort: v })}
        tags={tags}
        onTagsChange={v => updateFilters({ tags: v })}
      />

      <div className="mx-auto">
        {exploreViewMode === "map" ? (
          <div className="mt-20 flex flex-col lg:mt-16 lg:h-[calc(100vh-8rem)] lg:flex-row">
            <div className="order-2 px-4 pt-5 sm:px-6 lg:order-1 lg:w-110 lg:border-r lg:border-stone-200 lg:px-5 lg:pt-6">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-stone-500">
                  {isLoading ? t("common.searching") : `${total} ${t("common.resultsFound")}`}
                  {isFetchingNextPage && " · " + t("common.loading")}
                </p>
              </div>

              <div className="overflow-visible lg:h-[calc(100vh-190px)] lg:overflow-y-auto lg:scrollbar-hide">
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
                        {isFetchingNextPage ? t("common.loading") : t("common.loadMore")}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="order-1 h-[44svh] min-h-80 w-full border-b border-stone-200 lg:order-2 lg:h-full lg:min-h-0 lg:flex-1 lg:border-b-0">
              <PlacesMap places={allPlaces} className="h-full w-full" />
            </div>
          </div>
        ) : (
          <div className="mx-auto mt-23 max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-stone-500">
                  {isLoading ? t("common.searching") : `${total} ${t("common.resultsFound")}`}
                  {isFetchingNextPage && " · " + t("common.loading")}
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
                    {isFetchingNextPage ? t("common.loading") : t("common.loadMore")}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {!isLoading && allPlaces.length === 0 && (
          <div className="py-20 text-center">
            <p className="font-serif text-xl text-stone-600">{ t("common.unfound") }</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
