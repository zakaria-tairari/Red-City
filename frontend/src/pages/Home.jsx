import HeroSection from "@/components/home/HeroSection";
import FeaturedPlaces from "@/components/home/FeaturedPlaces";
import CategorySection from "@/components/home/CategorySection";
import { fetchCategories } from "@/services/categories";
import { Button } from "@/components/ui/Button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  const { data: categories } = useQuery({
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
      <section className="py-10 px-10 mb-20 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-9 items-center justify-center py-8 px-30 rounded-4xl bg-linear-to-br from-stone-700 to-stone-950"
        >
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="font-display text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-white"
          >
            Marrakech is not a city you visite, It's a{" "}
            <span className="text-primary-500">world</span> you feel.
          </motion.h2>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="flex items-center justify-center gap-5"
          >
            <Button asChild>
              <Link to="/explore">Start Exploring</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/register">Create Account</Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>
    </>
  );
}
