import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Globe,
  GripVertical,
  Image,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import {
  createAdminPlace,
  getAdminPlace,
  updateAdminPlace,
} from "@/services/admin";
import { fetchCategories } from "@/services/categories";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { AdminErrorState } from "@/components/admin/AdminPageState";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { useUIStore } from "@/store/useUIStore";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/admin";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const emptyForm = {
  document_id: "",
  name: "",
  category_id: "",
  email: "",
  phone: "",
  website: "",
  area: "",
  address: "",
  lat: "",
  lon: "",
  summary: "",
  description: "",
};

const emptyMediaItem = {
  type: "image",
  original_url: "",
  app_url: "",
  app_path: "",
  file: null,
  preview_url: "",
  storage_status: "done",
};

const emptyTranslations = {
  en: { summary: "", description: "" },
  es: { summary: "", description: "" },
};

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
];

const VIDEO_EXTENSIONS = [
  ".mp4",
  ".webm",
  ".mov",
  ".m4v",
  ".ogg",
  ".ogv",
  ".mkv",
];

function mediaTypeFromFile(file) {
  if (!file) return "image";
  const name = file.name.toLowerCase();
  if (VIDEO_EXTENSIONS.some(ext => name.endsWith(ext))) return "video";
  if (file.type.startsWith("video/")) return "video";
  return "image";
}

function mediaTypeFromUrl(url) {
  if (!url) return "image";
  const path = url.split("?")[0].toLowerCase();
  if (VIDEO_EXTENSIONS.some(ext => path.endsWith(ext))) return "video";
  return "image";
}

function resolveMediaType(item) {
  if (item.file) return mediaTypeFromFile(item.file);
  return mediaTypeFromUrl(
    item.preview_url || item.app_url || item.original_url,
  );
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function getInitialForm(place) {
  if (!place) return emptyForm;
  return {
    document_id: place.document_id ?? "",
    name: place.name ?? "",
    category_id: String(place.category?.id ?? ""),
    email: place.email ?? "",
    phone: place.phone ?? "",
    website: place.website ?? "",
    area: place.area ?? "",
    address: place.address ?? "",
    lat: place.lat ?? "",
    lon: place.lon ?? "",
    summary: place.summary ?? "",
    description: place.description ?? "",
  };
}

function getInitialTranslations(place) {
  const loaded = {
    en: { ...emptyTranslations.en },
    es: { ...emptyTranslations.es },
  };
  if (!place?.translations) return loaded;
  for (const t of place.translations) {
    if (loaded[t.language]) {
      loaded[t.language] = {
        summary: t.summary ?? "",
        description: t.description ?? "",
      };
    }
  }
  return loaded;
}

function getInitialMedia(place) {
  if (!place?.media) return [];
  const media = [place.media.cover, ...(place.media.gallery ?? [])].filter(
    Boolean,
  );
  return media
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((item, index) => ({
      id: item.id,
      type: mediaTypeFromUrl(item.app_url || item.original_url),
      original_url: item.original_url ?? "",
      app_url: item.app_url ?? "",
      app_path: item.app_path ?? "",
      file: null,
      preview_url: "",
      storage_status: item.storage_status ?? "pending",
      position: item.position ?? index,
    }));
}

function isFile(value) {
  return typeof File !== "undefined" && value instanceof File;
}

function appendFormData(formData, key, value) {
  if (value === undefined) return;
  if (value === null) {
    formData.append(key, "");
    return;
  }
  if (isFile(value)) {
    formData.append(key, value);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      appendFormData(formData, `${key}[${index}]`, item),
    );
    return;
  }
  if (typeof value === "object") {
    Object.entries(value).forEach(([k, v]) =>
      appendFormData(formData, `${key}[${k}]`, v),
    );
    return;
  }
  formData.append(key, value);
}

function toFormData(data) {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) =>
    appendFormData(formData, key, value),
  );
  return formData;
}

// ─────────────────────────────────────────────
// Root component — data fetching
// ─────────────────────────────────────────────

export default function AdminPlaceEdit() {
  const { id } = useParams();
  const isCreateMode = !id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addNotification = useUIStore(s => s.addNotification);

  const {
    data: placeResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["adminPlace", id],
    queryFn: () => getAdminPlace(id),
    enabled: !isCreateMode,
  });

  const { data: categoriesResponse } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const place = placeResponse?.data;
  const initialForm = useMemo(() => getInitialForm(place), [place]);
  const initialTranslations = useMemo(
    () => getInitialTranslations(place),
    [place],
  );
  const initialMedia = useMemo(() => getInitialMedia(place), [place]);

  const saveMutation = useMutation({
    mutationFn: data => {
      const payload = {
        ...data,
        category_id: data.category_id ? Number(data.category_id) : undefined,
        lat: data.lat === "" ? null : Number(data.lat),
        lon: data.lon === "" ? null : Number(data.lon),
      };
      const hasUploads = payload.media?.some(item => isFile(item.file));
      const body = hasUploads ? toFormData(payload) : payload;
      return isCreateMode ? createAdminPlace(body) : updateAdminPlace(id, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPlaces"] });
      if (!isCreateMode)
        queryClient.invalidateQueries({ queryKey: ["adminPlace", id] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      addNotification({
        type: "success",
        message: isCreateMode ? "Place created" : "Place updated",
      });
      navigate("/admin/places");
    },
    onError: err => {
      addNotification({
        type: "error",
        message: getApiErrorMessage(err, "Update failed"),
      });
    },
  });

  const categories = categoriesResponse ?? [];

  if (!isCreateMode && isLoading)
    return <Skeleton className="h-96 w-full rounded-xl" />;
  if (!isCreateMode && isError) {
    return (
      <AdminErrorState
        message={getApiErrorMessage(error, "Could not load this place.")}
        onRetry={refetch}
      />
    );
  }
  if (!isCreateMode && !place)
    return <AdminErrorState message="Place not found." />;

  return (
    <PlaceEditForm
      key={place?.id ?? "create"}
      formInitialValue={initialForm}
      translationsInitialValue={initialTranslations}
      mediaInitialValue={initialMedia}
      categories={categories}
      saveMutation={saveMutation}
      isCreateMode={isCreateMode}
    />
  );
}

// ─────────────────────────────────────────────
// PlaceEditForm — controlled form
// ─────────────────────────────────────────────

function PlaceEditForm({
  formInitialValue,
  translationsInitialValue,
  mediaInitialValue,
  categories,
  saveMutation,
  isCreateMode,
}) {
  const [form, setForm] = useState(formInitialValue);
  const [translations, setTranslations] = useState(translationsInitialValue);
  const [media, setMedia] = useState(mediaInitialValue);
  const [activeLang, setActiveLang] = useState("en");
  const addNotification = useUIStore(s => s.addNotification);

  const updateField = (field, value) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const updateTranslation = (lang, field, value) =>
    setTranslations(prev => ({
      ...prev,
      [lang]: { ...prev[lang], [field]: value },
    }));

  const addMedia = () => setMedia(items => [...items, { ...emptyMediaItem }]);

  const removeMedia = index =>
    setMedia(items => items.filter((_, i) => i !== index));

  // Drag-to-reorder: swap dragged item with drop target
  const moveMedia = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    setMedia(items => {
      const moved = items[fromIndex];
      if (toIndex === 0 && resolveMediaType(moved) === "video") {
        addNotification({
          type: "error",
          message: "Cover must be an image. Move the video to another position.",
        });
        return items;
      }
      const next = [...items];
      const [removed] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, removed);
      return next;
    });
  };

  const updateMediaFile = (index, file) => {
    if (!file) return;
    const type = mediaTypeFromFile(file);
    if (index === 0 && type === "video") {
      addNotification({
        type: "error",
        message: "Cover must be an image. Upload a photo for the cover slot.",
      });
      return;
    }
    setMedia(items =>
      items.map((item, i) => {
        if (i !== index) return item;
        return {
          ...item,
          file,
          preview_url: URL.createObjectURL(file),
          storage_status: "done",
          type,
        };
      }),
    );
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (form.lat !== "" && Number.isNaN(Number(form.lat))) {
      addNotification({ type: "error", message: "Latitude must be a number" });
      return;
    }
    if (form.lon !== "" && Number.isNaN(Number(form.lon))) {
      addNotification({ type: "error", message: "Longitude must be a number" });
      return;
    }
    if (media.length > 0 && resolveMediaType(media[0]) === "video") {
      addNotification({
        type: "error",
        message:
          "Cover must be an image. Reorder media or replace the first item.",
      });
      return;
    }
    saveMutation.mutate({
      ...form,
      document_id: form.document_id.trim() || undefined,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      website: form.website.trim(),
      area: form.area.trim(),
      address: form.address.trim(),
      translations,
      media: media
        .map((item, index) => ({
          id: item.id,
          type: resolveMediaType(item),
          original_url: item.original_url?.trim() || undefined,
          app_url: item.app_path || undefined,
          file: item.file || undefined,
          storage_status: item.storage_status,
          position: index,
        }))
        .filter(item => item.file || item.original_url || item.app_url),
    });
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="gap-2">
        <Link to="/admin/places">
          <ArrowLeft className="h-4 w-4" />
          Back to places
        </Link>
      </Button>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Place details ── */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">
              {isCreateMode ? "Create place" : "Edit place"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-stone-700">
                  Document ID
                </label>
                <Input
                  value={form.document_id}
                  onChange={e => updateField("document_id", e.target.value)}
                  placeholder="Auto-generated when empty"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-stone-700">
                  Name
                </label>
                <Input
                  value={form.name}
                  onChange={e => updateField("name", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">
                  Category
                </label>
                <Select
                  value={form.category_id || "none"}
                  onValueChange={val =>
                    updateField("category_id", val === "none" ? "" : val)
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Select category</SelectItem>
                    {(Array.isArray(categories) ? categories : []).map(cat => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">
                  Area
                </label>
                <Input
                  value={form.area}
                  onChange={e => updateField("area", e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">
                  Email
                </label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={e => updateField("email", e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">
                  Phone
                </label>
                <Input
                  value={form.phone}
                  onChange={e => updateField("phone", e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-stone-700">
                  Website
                </label>
                <Input
                  value={form.website}
                  onChange={e => updateField("website", e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-stone-700">
                  Address
                </label>
                <Input
                  value={form.address}
                  onChange={e => updateField("address", e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">
                  Latitude
                </label>
                <Input
                  type="number"
                  step="any"
                  value={form.lat}
                  onChange={e => updateField("lat", e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">
                  Longitude
                </label>
                <Input
                  type="number"
                  step="any"
                  value={form.lon}
                  onChange={e => updateField("lon", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Media ── */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="font-display text-xl flex items-center gap-2">
                <Image className="h-5 w-5 text-primary-600" />
                Media
              </CardTitle>
              <p className="mt-1 text-sm text-stone-500">
                The first item is the cover (images only). Gallery items can be
                images or videos. Type is set from the file extension. Drag to
                reorder.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addMedia}
              className="shrink-0"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add media
            </Button>
          </CardHeader>
          <CardContent>
            {media.length === 0 ? (
              <button
                type="button"
                onClick={addMedia}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-stone-200 p-10 text-sm text-stone-400 transition-colors hover:border-primary-400 hover:text-primary-500"
              >
                <Upload className="h-7 w-7" />
                Click to add your first media item
              </button>
            ) : (
              <MediaGrid
                media={media}
                onMove={moveMedia}
                onRemove={removeMedia}
                onUpdateFile={updateMediaFile}
              />
            )}
          </CardContent>
        </Card>

        {/* ── Content & Translations ── */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary-600" />
              Content & Translations
            </CardTitle>
            <p className="text-sm text-stone-500">
              Edit the summary and description for each language.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Language tabs */}
            <div className="flex gap-1 rounded-xl bg-stone-100 p-1">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setActiveLang(lang.code)}
                  className={cn(
                    "flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                    activeLang === lang.code
                      ? "bg-white text-stone-900 shadow-sm"
                      : "text-stone-500 hover:text-stone-700",
                  )}
                >
                  {lang.label}
                  <span className="ml-1.5 text-xs uppercase text-stone-400">
                    ({lang.code})
                  </span>
                </button>
              ))}
            </div>

            <div>
              {/* English */}
              <TranslationFields
                hidden={activeLang !== "en"}
                summary={translations.en?.summary ?? ""}
                description={translations.en?.description ?? ""}
                onSummaryChange={v => updateTranslation("en", "summary", v)}
                onDescriptionChange={v =>
                  updateTranslation("en", "description", v)
                }
                summaryPlaceholder="English summary…"
                descriptionPlaceholder="English description…"
              />

              {/* French (stored in main form) */}
              <TranslationFields
                hidden={activeLang !== "fr"}
                summary={form.summary}
                description={form.description}
                onSummaryChange={v => updateField("summary", v)}
                onDescriptionChange={v => updateField("description", v)}
                summaryPlaceholder="Résumé en français…"
                descriptionPlaceholder="Description en français…"
              />

              {/* Spanish */}
              <TranslationFields
                hidden={activeLang !== "es"}
                summary={translations.es?.summary ?? ""}
                description={translations.es?.description ?? ""}
                onSummaryChange={v => updateTranslation("es", "summary", v)}
                onDescriptionChange={v =>
                  updateTranslation("es", "description", v)
                }
                summaryPlaceholder="Resumen en español…"
                descriptionPlaceholder="Descripción en español…"
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Actions ── */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" asChild>
            <Link to="/admin/places">Cancel</Link>
          </Button>
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending
              ? "Saving…"
              : isCreateMode
                ? "Create place"
                : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function MediaGrid({ media, onMove, onRemove, onUpdateFile }) {
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== index) onMove(dragIndex, index);
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
      {media.map((item, index) => {
        const isCover = index === 0;
        const mediaType = resolveMediaType(item);
        const previewUrl =
          item.preview_url || item.app_url || item.original_url;
        const isDragging = dragIndex === index;
        const isDragOver = dragOverIndex === index && dragIndex !== index;

        return (
          <div
            key={item.id ?? index}
            draggable
            onDragStart={e => handleDragStart(e, index)}
            onDragOver={e => handleDragOver(e, index)}
            onDrop={e => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={cn(
              "group relative flex flex-col overflow-hidden rounded-xl shadow-sm transition-all",
              isDragging && "opacity-40 scale-95",
              isDragOver && "ring-2 ring-primary-400 scale-[1.02]",
            )}
          >
            {/* Thumbnail */}
            <div className="relative aspect-square w-full overflow-hidden bg-stone-200">
              {previewUrl && mediaType === "video" ? (
                <video
                  src={previewUrl}
                  className="h-full w-full object-cover"
                  muted
                />
              ) : previewUrl ? (
                <img
                  src={previewUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Image className="h-8 w-8 text-stone-300" />
                </div>
              )}

              {/* Cover badge */}
              {isCover && (
                <span className="absolute left-2 top-2 rounded-full bg-primary-600 px-2 py-1 text-xs font-semibold text-white shadow">
                  Cover
                </span>
              )}

              {/* Position badge */}
              {!isCover && (
                <span className="absolute left-2 top-2 rounded-full bg-black/40 h-7 w-7 text-xs text-center leading-7 font-semibold text-white backdrop-blur-sm">
                  {index + 1}
                </span>
              )}

              {/* Drag handle — visible on hover */}
              <div className="absolute right-2 top-2 cursor-grab rounded-lg bg-black/40 p-1 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 active:cursor-grabbing">
                <GripVertical className="h-4 w-4 text-white" />
              </div>

              {/* Delete button — visible on hover */}
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="absolute bottom-2 right-2 rounded-lg bg-red-500 p-1.5 opacity-0 shadow transition-opacity group-hover:opacity-100 hover:bg-red-600"
                title="Remove"
              >
                <Trash2 className="h-4 w-4 text-white" />
              </button>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-2 border-t border-stone-100 p-2">
              <span className="flex h-7 flex-1 items-center rounded-lg border border-stone-200 bg-stone-50 px-2 text-xs font-medium capitalize text-stone-600">
                {mediaType}
              </span>

              <label
                className="flex h-7 cursor-pointer items-center gap-1 rounded-lg border border-stone-200 bg-white px-2 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-50"
                title={isCover ? "Upload cover image" : "Upload file"}
              >
                <Upload className="h-3 w-3" />
                Upload
                <input
                  type="file"
                  accept={
                    isCover
                      ? "image/*"
                      : "image/*,video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                  }
                  className="sr-only"
                  onChange={e => {
                    onUpdateFile(index, e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>

            {/* File name */}
            {(item.file?.name || item.app_path || item.original_url) && (
              <p className="truncate px-2 pb-2 text-xs text-stone-400">
                {item.file?.name || item.app_path || item.original_url}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TranslationFields({
  hidden,
  summary,
  description,
  onSummaryChange,
  onDescriptionChange,
  summaryPlaceholder,
  descriptionPlaceholder,
}) {
  return (
    <div className={cn("space-y-4", hidden && "hidden")}>
      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">
          Summary
        </label>
        <textarea
          className="flex min-h-20 w-full rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          value={summary}
          onChange={e => onSummaryChange(e.target.value)}
          placeholder={summaryPlaceholder}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">
          Description
        </label>
        <textarea
          className="flex min-h-180 w-full rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          value={description}
          onChange={e => onDescriptionChange(e.target.value)}
          placeholder={descriptionPlaceholder}
        />
      </div>
    </div>
  );
}
