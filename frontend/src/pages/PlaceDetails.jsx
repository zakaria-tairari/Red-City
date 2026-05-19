import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Clock,
  ExternalLink,
  Heart,
  MapPin,
  Navigation,
  Phone,
  Share2,
  Globe,
  AtSign,
} from 'lucide-react'
import {
  fetchPlace,
  fetchNearbyPlaces,
} from '@/services/placesService'
import { CATEGORY_MAP } from '@/data/categories'
import { getOpenStatus, getPriceLabel } from '@/lib/utils'
import { useFavoritesStore } from '@/store/useFavoritesStore'
import PlaceGallery from '@/components/place/PlaceGallery'
import ReviewsSection from '@/components/place/ReviewsSection'
import PlacesMap from '@/components/map/PlacesMap'
import { PlaceCard } from '@/components/ui/PlaceCard'
import { RatingStars } from '@/components/ui/RatingStars'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

export default function PlaceDetails() {
  const { id } = useParams()
  const { isFavorite, toggleFavorite } = useFavoritesStore()

  const { data: place, isLoading, error } = useQuery({
    queryKey: ['place', id],
    queryFn: () => fetchPlace(id),
  })

  const { data: nearby } = useQuery({
    queryKey: ['nearby', id],
    queryFn: () => fetchNearbyPlaces(id),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="pt-16 mx-auto max-w-7xl px-4 py-8 space-y-6">
        <Skeleton className="aspect-[21/9] w-full rounded-2xl" />
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error || !place) {
    return (
      <div className="pt-32 text-center">
        <p className="font-serif text-xl">Place not found</p>
        <Button asChild className="mt-4">
          <Link to="/explore">Back to explore</Link>
        </Button>
      </div>
    )
  }

  const category = CATEGORY_MAP[place.category]
  const openStatus = getOpenStatus(place.hours)
  const fav = isFavorite(place.id)

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: place.name, url: window.location.href })
    } else {
      navigator.clipboard?.writeText(window.location.href)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-16 pb-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <PlaceGallery
          images={place.images}
          videoUrl={place.id === '47' ? 'preview' : null}
        />

        <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            {category && (
              <Badge variant="secondary" className="mb-3">{category.name}</Badge>
            )}
            <h1 className="font-display text-3xl md:text-4xl font-bold text-stone-900">
              {place.name}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <RatingStars rating={place.rating} />
              <span className="text-stone-500">
                {place.reviewCount.toLocaleString()} reviews
              </span>
              <span className="text-stone-400">·</span>
              <span className="flex items-center gap-1 text-stone-600">
                <MapPin className="h-4 w-4" />
                {place.address}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium',
                  openStatus.isOpen
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-stone-100 text-stone-600'
                )}
              >
                <Clock className="h-3.5 w-3.5" />
                {openStatus.label}
              </span>
              <span className="text-stone-500">{getPriceLabel(place.priceRange)}</span>
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            <Button
              variant={fav ? 'default' : 'outline'}
              onClick={() => toggleFavorite(place.id)}
            >
              <Heart className={cn('h-4 w-4', fav && 'fill-current')} />
              {fav ? 'Saved' : 'Save'}
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="h-4 w-4" /> Share
            </Button>
            <Button variant="outline" asChild>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Navigation className="h-4 w-4" /> Directions
              </a>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="mt-10">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="nearby">Nearby</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h3 className="font-serif text-xl font-semibold mb-3">About</h3>
                  <p className="text-stone-600 leading-relaxed">{place.description}</p>
                </div>
                {place.features?.length > 0 && (
                  <div>
                    <h3 className="font-serif text-xl font-semibold mb-3">Highlights</h3>
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {place.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-stone-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {place.amenities?.length > 0 && (
                  <div>
                    <h3 className="font-serif text-xl font-semibold mb-3">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {place.amenities.map((a) => (
                        <Badge key={a} variant="outline">{a}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {place.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {place.tags.map((t) => (
                      <Badge key={t}>{t}</Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-stone-100 bg-stone-50 p-6 space-y-4 h-fit">
                <h3 className="font-serif text-lg font-semibold">Contact</h3>
                {place.phone && (
                  <a href={`tel:${place.phone}`} className="flex items-center gap-2 text-stone-600 hover:text-primary-600">
                    <Phone className="h-4 w-4" /> {place.phone}
                  </a>
                )}
                {place.website && (
                  <a href={place.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-stone-600 hover:text-primary-600">
                    <Globe className="h-4 w-4" /> Website <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {place.socials?.instagram && (
                  <p className="flex items-center gap-2 text-stone-600">
                    <AtSign className="h-4 w-4" /> {place.socials.instagram}
                  </p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="photos">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {place.images.map((img, i) => (
                <img key={i} src={img} alt="" className="rounded-2xl aspect-[4/3] object-cover w-full" />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            <ReviewsSection
              placeId={place.id}
              placeRating={place.rating}
              reviewCount={place.reviewCount}
            />
          </TabsContent>

          <TabsContent value="nearby">
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {nearby?.map((p) => (
                <PlaceCard key={p.id} place={p} variant="horizontal" />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="location">
            <div className="h-[400px] rounded-2xl overflow-hidden">
              <PlacesMap places={[place, ...(nearby || [])]} />
            </div>
            <p className="mt-4 text-stone-600">{place.address}</p>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  )
}
