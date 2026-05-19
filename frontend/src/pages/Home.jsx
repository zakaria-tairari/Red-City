import HeroSection from '@/components/home/HeroSection'
import FeaturedPlaces from '@/components/home/FeaturedPlaces'
import CategorySection from '@/components/home/CategorySection'
import { CATEGORIES } from '@/data/categories'

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturedPlaces />
      <div className="bg-stone-50">
        {CATEGORIES.map((category) => (
          <CategorySection key={category.id} category={category} />
        ))}
      </div>
    </>
  )
}
