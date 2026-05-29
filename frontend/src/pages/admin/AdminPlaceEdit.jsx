import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowDown, ArrowLeft, ArrowUp, Globe, Image, Plus, Star, Trash2, Upload } from 'lucide-react'
import { createAdminPlace, getAdminPlace, updateAdminPlace } from '@/services/admin'
import { fetchCategories } from '@/services/categories'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { AdminErrorState } from '@/components/admin/AdminPageState'
import { Skeleton } from '@/components/ui/Skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { useUIStore } from '@/store/useUIStore'
import { cn } from '@/lib/utils'
import { getApiErrorMessage } from '@/lib/admin'


const emptyForm = {
  document_id: '',
  name: '',
  category_id: '',
  email: '',
  phone: '',
  website: '',
  area: '',
  address: '',
  lat: '',
  lon: '',
  // French (default DB language) — stored on the places table
  summary: '',
  description: '',
}

const emptyMediaItem = {
  type: 'image',
  original_url: '',
  app_url: '',
  app_path: '',
  file: null,
  preview_url: '',
  storage_status: 'done',
}

const emptyTranslations = {
  en: { summary: '', description: '' },
  es: { summary: '', description: '' },
}

function getInitialForm(place) {
  if (!place) return emptyForm

  return {
    document_id: place.document_id ?? '',
    name: place.name ?? '',
    category_id: String(place.category?.id ?? ''),
    email: place.email ?? '',
    phone: place.phone ?? '',
    website: place.website ?? '',
    area: place.area ?? '',
    address: place.address ?? '',
    lat: place.lat ?? '',
    lon: place.lon ?? '',
    summary: place.summary ?? '',
    description: place.description ?? '',
  }
}

function getInitialTranslations(place) {
  const loaded = {
    en: { ...emptyTranslations.en },
    es: { ...emptyTranslations.es },
  }

  if (!place?.translations) return loaded

  for (const translation of place.translations) {
    if (loaded[translation.language]) {
      loaded[translation.language] = {
        summary: translation.summary ?? '',
        description: translation.description ?? '',
      }
    }
  }

  return loaded
}

function getInitialMedia(place) {
  if (!place?.media) return []

  const media = [
    place.media.cover,
    ...(place.media.gallery ?? []),
  ].filter(Boolean)

  return media
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((item, index) => ({
      id: item.id,
      type: item.type ?? 'image',
      original_url: item.original_url ?? '',
      app_url: item.app_url ?? '',
      app_path: item.app_path ?? '',
      file: null,
      preview_url: '',
      storage_status: item.storage_status ?? 'pending',
      position: item.position ?? index,
    }))
}

function isFile(value) {
  return typeof File !== 'undefined' && value instanceof File
}

function appendFormData(formData, key, value) {
  if (value === undefined) return

  if (value === null) {
    formData.append(key, '')
    return
  }

  if (isFile(value)) {
    formData.append(key, value)
    return
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => appendFormData(formData, `${key}[${index}]`, item))
    return
  }

  if (typeof value === 'object') {
    Object.entries(value).forEach(([childKey, childValue]) => {
      appendFormData(formData, `${key}[${childKey}]`, childValue)
    })
    return
  }

  formData.append(key, value)
}

function toFormData(data) {
  const formData = new FormData()

  Object.entries(data).forEach(([key, value]) => appendFormData(formData, key, value))

  return formData
}

export default function AdminPlaceEdit() {
  const { id } = useParams()
  const isCreateMode = !id
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const addNotification = useUIStore((s) => s.addNotification)

  const { data: placeResponse, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['adminPlace', id],
    queryFn: () => getAdminPlace(id),
    enabled: !isCreateMode,
  })

  const { data: categoriesResponse } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })

  const place = placeResponse?.data
  const initialForm = useMemo(() => getInitialForm(place), [place])
  const initialTranslations = useMemo(() => getInitialTranslations(place), [place])
  const initialMedia = useMemo(() => getInitialMedia(place), [place])

  const saveMutation = useMutation({
    mutationFn: (data) => {
      const payload = {
        ...data,
        category_id: data.category_id ? Number(data.category_id) : undefined,
        lat: data.lat === '' ? null : Number(data.lat),
        lon: data.lon === '' ? null : Number(data.lon),
      }

      const hasUploads = payload.media?.some((item) => isFile(item.file))
      const body = hasUploads ? toFormData(payload) : payload

      return isCreateMode ? createAdminPlace(body) : updateAdminPlace(id, body)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPlaces'] })
      if (!isCreateMode) queryClient.invalidateQueries({ queryKey: ['adminPlace', id] })
      queryClient.invalidateQueries({ queryKey: ['adminStats'] })
      addNotification({ type: 'success', message: isCreateMode ? 'Place created' : 'Place updated' })
      navigate('/admin/places')
    },
    onError: (err) => {
      addNotification({ type: 'error', message: getApiErrorMessage(err, 'Update failed') })
    },
  })

  const categories = categoriesResponse ?? []

  if (!isCreateMode && isLoading) {
    return <Skeleton className="h-96 w-full rounded-xl" />
  }

  if (!isCreateMode && isError) {
    return (
      <AdminErrorState
        message={getApiErrorMessage(error, 'Could not load this place.')}
        onRetry={refetch}
      />
    )
  }

  if (!isCreateMode && !place) {
    return <AdminErrorState message="Place not found." />
  }

  return (
    <PlaceEditForm
      key={place?.id ?? 'create'}
      formInitialValue={initialForm}
      translationsInitialValue={initialTranslations}
      mediaInitialValue={initialMedia}
      categories={categories}
      saveMutation={saveMutation}
      isCreateMode={isCreateMode}
    />
  )
}

function PlaceEditForm({ formInitialValue, translationsInitialValue, mediaInitialValue, categories, saveMutation, isCreateMode }) {
  const [form, setForm] = useState(formInitialValue)
  const [translations, setTranslations] = useState(translationsInitialValue)
  const [media, setMedia] = useState(mediaInitialValue)
  const [activeLang, setActiveLang] = useState('en')
  const addNotification = useUIStore((s) => s.addNotification)

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const updateTranslation = (lang, field, value) =>
    setTranslations((prev) => ({
      ...prev,
      [lang]: { ...prev[lang], [field]: value },
    }))

  const updateMedia = (index, field, value) =>
    setMedia((items) => items.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [field]: value } : item
    ))

  const addMedia = () => setMedia((items) => [...items, { ...emptyMediaItem }])
  const removeMedia = (index) => setMedia((items) => items.filter((_, itemIndex) => itemIndex !== index))
  const makeCover = (index) =>
    setMedia((items) => {
      const next = [...items]
      const [selected] = next.splice(index, 1)
      return selected ? [selected, ...next] : items
    })
  const moveMedia = (index, direction) =>
    setMedia((items) => {
      const target = index + direction
      if (target < 0 || target >= items.length) return items

      const next = [...items]
      const current = next[index]
      next[index] = next[target]
      next[target] = current
      return next
    })
  const updateMediaFile = (index, file) => {
    if (!file) return

    setMedia((items) => items.map((item, itemIndex) => {
      if (itemIndex !== index) return item

      return {
        ...item,
        file,
        preview_url: URL.createObjectURL(file),
        original_url: item.original_url,
        storage_status: 'done',
        type: file.type.startsWith('video/') ? 'video' : 'image',
      }
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (form.lat !== '' && Number.isNaN(Number(form.lat))) {
      addNotification({ type: 'error', message: 'Latitude must be a number' })
      return
    }

    if (form.lon !== '' && Number.isNaN(Number(form.lon))) {
      addNotification({ type: 'error', message: 'Longitude must be a number' })
      return
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
          type: item.type,
          original_url: item.original_url?.trim() || undefined,
          app_url: item.app_path || undefined,
          file: item.file || undefined,
          storage_status: item.storage_status,
          position: index,
        }))
        .filter((item) => item.file || item.original_url || item.app_url),
    })
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="gap-2">
        <Link to="/admin/places">
          <ArrowLeft className="h-4 w-4" />
          Back to places
        </Link>
      </Button>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Place details card ── */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">{isCreateMode ? 'Create place' : 'Edit place'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-stone-700">Document ID</label>
                <Input
                  value={form.document_id}
                  onChange={(e) => updateField('document_id', e.target.value)}
                  placeholder="Auto-generated when empty"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-stone-700">Name</label>
                <Input value={form.name} onChange={(e) => updateField('name', e.target.value)} required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">Category</label>
                <Select
                  value={form.category_id || 'none'}
                  onValueChange={(val) => updateField('category_id', val === 'none' ? '' : val)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Select category</SelectItem>
                    {(Array.isArray(categories) ? categories : []).map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">Area</label>
                <Input value={form.area} onChange={(e) => updateField('area', e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">Email</label>
                <Input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">Phone</label>
                <Input value={form.phone} onChange={(e) => updateField('phone', e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-stone-700">Website</label>
                <Input value={form.website} onChange={(e) => updateField('website', e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-stone-700">Address</label>
                <Input value={form.address} onChange={(e) => updateField('address', e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">Latitude</label>
                <Input type="number" step="any" value={form.lat} onChange={(e) => updateField('lat', e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">Longitude</label>
                <Input type="number" step="any" value={form.lon} onChange={(e) => updateField('lon', e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-display text-xl flex items-center gap-2">
                <Image className="h-5 w-5 text-primary-600" />
                Media
              </CardTitle>
              <p className="mt-1 text-sm text-stone-500">
                Upload images or videos, choose the cover, and reorder the gallery.
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addMedia}>
              <Plus className="h-4 w-4" />
              Add media
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {media.length === 0 ? (
              <div className="rounded-xl border border-dashed border-stone-200 p-6 text-center text-sm text-stone-500">
                No media added yet.
              </div>
            ) : (
              media.map((item, index) => {
                const previewUrl = item.preview_url || item.app_url || item.original_url
                const isCover = index === 0

                return (
                  <div key={item.id ?? index} className="grid gap-3 rounded-xl border border-stone-100 bg-stone-50/60 p-3 lg:grid-cols-[112px_1fr_156px_112px] lg:items-center">
                    <div className="relative h-24 overflow-hidden rounded-lg bg-stone-200">
                      {previewUrl && item.type === 'video' ? (
                        <video src={previewUrl} className="h-full w-full object-cover" muted />
                      ) : previewUrl ? (
                        <img src={previewUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-stone-500">
                          #{index + 1}
                        </div>
                      )}
                      {isCover && (
                        <span className="absolute left-2 top-2 rounded-full bg-primary-600 px-2 py-0.5 text-xs font-semibold text-white">
                          Cover
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          className="h-10 rounded-xl border border-stone-200 bg-white px-3 text-sm"
                          value={item.type}
                          onChange={(e) => updateMedia(index, 'type', e.target.value)}
                        >
                          <option value="image">Image</option>
                          <option value="video">Video</option>
                        </select>
                        <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100">
                          <Upload className="h-4 w-4" />
                          {item.file || previewUrl ? 'Replace file' : 'Upload file'}
                          <input
                            type="file"
                            accept="image/*,video/mp4,video/webm,video/quicktime"
                            className="sr-only"
                            onChange={(e) => updateMediaFile(index, e.target.files?.[0])}
                          />
                        </label>
                      </div>
                      <p className="truncate text-xs text-stone-500">
                        {item.file?.name || item.app_path || item.original_url || 'No file selected'}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        type="button"
                        variant={isCover ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => makeCover(index)}
                        disabled={isCover}
                        title="Make cover"
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => moveMedia(index, -1)}
                        disabled={index === 0}
                        title="Move up"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => moveMedia(index, 1)}
                        disabled={index === media.length - 1}
                        title="Move down"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between gap-2 lg:justify-end">
                      <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-stone-600">
                        Position {index + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-red-600"
                        onClick={() => removeMedia(index)}
                        title="Remove media"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })
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
              {[
                { code: 'en', label: 'English' },
                { code: 'fr', label: 'Français' },
                { code: 'es', label: 'Español' },
              ].map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setActiveLang(lang.code)}
                  className={cn(
                    'flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all',
                    activeLang === lang.code
                      ? 'bg-white text-stone-900 shadow-sm'
                      : 'text-stone-500 hover:text-stone-700'
                  )}
                >
                  {lang.label}
                  <span className="ml-1.5 text-xs uppercase text-stone-400">({lang.code})</span>
                </button>
              ))}
            </div>

            {/* ── English tab — translations.en ── */}
            <div className={cn('space-y-4', activeLang !== 'en' && 'hidden')}>
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">Summary</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  value={translations.en?.summary ?? ''}
                  onChange={(e) => updateTranslation('en', 'summary', e.target.value)}
                  placeholder="English summary…"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">Description</label>
                <textarea
                  className="flex min-h-[160px] w-full rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  value={translations.en?.description ?? ''}
                  onChange={(e) => updateTranslation('en', 'description', e.target.value)}
                  placeholder="English description…"
                />
              </div>
            </div>

            {/* ── French tab — form.summary / form.description (places table) ── */}
            <div className={cn('space-y-4', activeLang !== 'fr' && 'hidden')}>
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">Summary</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  value={form.summary}
                  onChange={(e) => updateField('summary', e.target.value)}
                  placeholder="Résumé en français…"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">Description</label>
                <textarea
                  className="flex min-h-[160px] w-full rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Description en français…"
                />
              </div>
            </div>

            {/* ── Spanish tab — translations.es ── */}
            <div className={cn('space-y-4', activeLang !== 'es' && 'hidden')}>
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">Summary</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  value={translations.es?.summary ?? ''}
                  onChange={(e) => updateTranslation('es', 'summary', e.target.value)}
                  placeholder="Resumen en español…"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">Description</label>
                <textarea
                  className="flex min-h-[160px] w-full rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  value={translations.es?.description ?? ''}
                  onChange={(e) => updateTranslation('es', 'description', e.target.value)}
                  placeholder="Descripción en español…"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Actions ── */}
        <div className="flex gap-3">
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Saving...' : isCreateMode ? 'Create place' : 'Save changes'}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link to="/admin/places">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
