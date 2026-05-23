import { Link } from "react-router-dom";
import { MapPin, Star, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/useUIStore";

export default function ExploreListItem({ place }) {
  const { selectedPlaceId, setSelectedPlaceId } = useUIStore();
  const isSelected = selectedPlaceId === place.id;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => {
        if (isSelected) {
          setSelectedPlaceId(null);
          queueMicrotask(() => setSelectedPlaceId(place.id));
        } else {
          setSelectedPlaceId(place.id);
        }
      }}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setSelectedPlaceId(place.id);
        }
      }}
      className={cn(
        "flex w-full cursor-pointer gap-4 rounded-xl border p-3 text-left transition-all",
        isSelected
          ? "border-primary-200 bg-primary-50 shadow-md"
          : "border-stone-100 shadow-sm bg-white hover:border-stone-200 hover:shadow-md hover:-translate-y-0.5",
      )}
    >
      <img
        src={place.cover?.app_url || place.cover?.original_url}
        alt={place.name}
        className="max-h-24 w-20 shrink-0 rounded-lg object-cover"
      />
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-serif font-semibold text-stone-900">
          {place.name}
        </h3>
        <div className="mt-1 flex items-center gap-2 text-xs text-stone-500">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="font-medium text-stone-700">4.5</span>
          <span>1.2k</span>
        </div>
        <p className="mt-1 flex items-center gap-1 text-xs text-stone-400">
          <MapPin className="h-3 w-3" />
          {place.area}
          {place.distance != null && ` · ${place.distance.toFixed(1)} km`}
        </p>
        <Link
          to={`/places/${place.id}`}
          className="group mt-3 flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
        >
          <span>View details</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
