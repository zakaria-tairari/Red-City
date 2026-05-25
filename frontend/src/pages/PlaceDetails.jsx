import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Clock,
  ExternalLink,
  Heart,
  MapPin,
  Navigation,
  Phone,
  Share2,
  Globe,
  Mail,
} from "lucide-react";
import { getOpenStatus, getPriceLabel } from "@/lib/utils";
import { useFavoritesStore } from "@/store/useFavoritesStore";
import PlaceGallery from "@/components/place/PlaceGallery";
import ReviewsSection from "@/components/place/ReviewsSection";
import PlacesMap from "@/components/map/PlacesMap";
import { PlaceCard } from "@/components/ui/PlaceCard";
import { RatingStars } from "@/components/ui/RatingStars";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useUIStore } from "@/store/useUIStore";
import { cn } from "@/lib/utils";
import { fetchPlaceById, fetchRelatedPlaces } from "../services/places";
import ReactMarkdown from "react-markdown";
import PlacesRow from "../components/ui/PlacesRow";

export default function PlaceDetails() {
  const { id } = useParams();
  const { isFavorite, toggleFavorite } = useFavoritesStore();

  const {
    data: place,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["place", id],
    queryFn: () => fetchPlaceById(id),
  });

  const { data: related } = useQuery({
    queryKey: ["nearby", id],
    queryFn: () => fetchRelatedPlaces(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="pt-16 mx-auto max-w-7xl px-4 py-8 space-y-6">
        <Skeleton className="aspect-video w-full rounded-2xl" />
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !place) {
    return (
      <div className="pt-32 text-center">
        <p className="font-serif text-xl">Place not found</p>
        <Button asChild className="mt-4">
          <Link to="/explore">Back to explore</Link>
        </Button>
      </div>
    );
  }

  const category = place?.category;
  const openStatus = getOpenStatus(place.opening_hours);
  const fav = isFavorite(place.id);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: place.name, url: window.location.href });
        useUIStore.getState().addNotification({
          type: "success",
          title: "Shared successfully!",
          message: `Shared link to "${place.name}".`,
        });
      } catch (err) {
        // user cancelled
      }
    } else {
      navigator.clipboard?.writeText(window.location.href);
      useUIStore.getState().addNotification({
        type: "success",
        title: "Link Copied!",
        message: `Copied details link of "${place.name}" to clipboard.`,
      });
    }
  };

  const galleryMedia = [place.media.cover, ...place.media.gallery].map(
    item => ({
      type: item.type === "video" ? "video" : "image",
      url: item.app_url || item.original_url,
    }),
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-16"
    >
      <div className="mx-auto max-w-7xl py-6">
        <PlaceGallery media={galleryMedia} />

        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            {category && (
              <Badge variant="outline" className="mb-3">
                {category.name}
              </Badge>
            )}
            <h1 className="font-display text-3xl md:text-4xl font-bold text-stone-900">
              {place.name}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
              <RatingStars rating={4.5} />
              <span className="text-stone-500">1.2k reviews</span>
              <span className="flex items-center gap-1 text-stone-600">
                <MapPin className="h-4 w-4" />
                {place.area} - {place.address}
              </span>
            </div>
            <div className="mt-5 pr-20">
              <ReactMarkdown>{place.summary}</ReactMarkdown>           
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            <Button
              variant={fav ? "default" : "outline"}
              onClick={() => toggleFavorite(place.id)}
            >
              <Heart className={cn("h-4 w-4", fav && "fill-current")} />
              {fav ? "Saved" : "Save"}
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="h-4 w-4" /> Share
            </Button>
            <Button variant="outline" asChild>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  useUIStore.getState().addNotification({
                    type: "info",
                    title: "Opening Map Directions",
                    message: `Routing path to "${place.name}" on Google Maps...`,
                  });
                }}
              >
                <Navigation className="h-4 w-4" /> Directions
              </a>
            </Button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3 mt-10">
          <div className="lg:col-span-2 space-y-6">
            <div className="markdown-content">
              <ReactMarkdown>{place.description}</ReactMarkdown>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-300 border-dashed bg-stone-50 p-6 space-y-4 h-fit">
            <h3 className="font-serif text-xl font-bold">Contact</h3>
            <div className="space-y-4">
              {place.phone && (
                <a
                  href={`tel:${place.phone}`}
                  className="flex items-center gap-2 text-stone-600 hover:text-primary-600"
                >
                  <Phone className="h-4 w-4" /> {place.phone}
                </a>
              )}
              {place.website && (
                <a
                  href={place.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-stone-600 hover:text-primary-600"
                >
                  <Globe className="h-4 w-4" /> Website{" "}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {place.email && (
                <p className="flex items-center gap-2 text-stone-600">
                  <Mail className="h-4 w-4" /> {place.email}
                </p>
              )}
            </div>
            <h3 className="font-serif text-xl font-bold mt-8">Tags</h3>
            <div>
              {place.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {place.tags.map(t => (
                    <Badge 
                    variant="secondary" 
                    key={t.id}>
                      #{t.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <section className="mb-5">
          <PlacesRow
            places={related}
            title="More experiences"
          />
        </section>

        <ReviewsSection
          placeId={place.id}
          placeRating={4.5}
          reviewCount={1200}
        />
      </div>
    </motion.div>
  );
}
