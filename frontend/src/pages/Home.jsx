import HeroSection from "@/components/home/HeroSection";
import FeaturedPlaces from "@/components/home/FeaturedPlaces";
import CategorySection from "@/components/home/CategorySection";
import { fetchCategories } from "@/services/categories";
import { Button } from "@/components/ui/Button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Trans } from "react-i18next";

export default function Home() {
  const { t } = useTranslation();

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  return (
    <>
      <HeroSection />
      <FeaturedPlaces />
      <div className="bg-stone-50">
        {categories?.map(category => (
          <CategorySection key={category.id} category={category} />
        ))}
      </div>
      <section className="mx-auto max-w-7xl px-4 py-15 sm:px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center gap-9 rounded-4xl bg-linear-to-br from-stone-700 to-stone-950 px-5 py-8 sm:px-10 lg:px-20"
        >
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="font-display text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-white"
          >
            <Trans
              i18nKey="hero.cardText"
              components={{
                1: <span className="text-primary-500" />
              }}
            />
          </motion.h2>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-3 sm:gap-5"
          >
            <Button asChild>
              <Link to="/explore">{t("common.exploreBtn")}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/register">{t("auth.createAccount")}</Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>
    </>
  );
}
