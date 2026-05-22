import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { fetchFeaturedPlaces } from "@/services/places";
import { PlaceCard } from "@/components/ui/PlaceCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTranslation } from "react-i18next";

export default function FeaturedPlaces() {
  const { t } = useTranslation();

  const { data: places, isLoading } = useQuery({
    queryKey: ["featured-places"],
    queryFn: fetchFeaturedPlaces,
  });
  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-stone-900">
              {t("featured.title")}
            </h2>
            <p className="mt-2 text-stone-500 max-w-xl text-balance">
              {t("featured.text")}
            </p>
          </div>
          <Link
            to="/explore?sort=rating"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            {t("common.viewAll")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-105 col-span-2 lg:row-span-2" />
            <Skeleton className="h-50" />
            <Skeleton className="h-50" />
            <Skeleton className="h-50" />
            <Skeleton className="h-50" />
          </div>
        ) : (
          <motion.div
            className="grid gap-6 grid-cols-2 lg:grid-cols-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1 } },
            }}
          >
            {places?.map((place, i) => (
              <motion.div
                key={place.id}
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  visible: { opacity: 1, y: 0 },
                }}
                className={i === 0 ? "col-span-2 md:row-span-2" : ""}
              >
                <PlaceCard
                  place={place}
                  variant="featured"
                  className={i === 0 ? "h-150 md:h-full min-h-105" : "h-90"}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
