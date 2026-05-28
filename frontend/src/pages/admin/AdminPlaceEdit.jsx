import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Globe } from 'lucide-react'
import { getAdminPlace, updateAdminPlace } from '@/services/admin'
import { fetchCategories } from '@/services/categories'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { useUIStore } from '@/store/useUIStore'
import { cn } from '@/lib/utils'


const emptyForm = {
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

const emptyTranslations = {
  en: { summary: '', description: '' },
  es: { summary: '', description: '' },
}

export default function AdminPlaceEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const addNotification = useUIStore((s) => s.addNotification)
  const [form, setForm] = useState(emptyForm)
  const [translations, setTranslations] = useState(emptyTranslations)
  const [activeLang, setActiveLang] = useState('en')

  const { data: placeResponse, isLoading } = useQuery({
    queryKey: ['adminPlace', id],
    queryFn: () => getAdminPlace(id),
  })

  const { data: categoriesResponse } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })

  const place = placeResponse?.data

  useEffect(() => {
    if (!place) return
    setForm({
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
    })

    // Populate translations from the loaded place data
    const loaded = { ...emptyTranslations }
    if (place.translations) {
      for (const t of place.translations) {
        if (loaded[t.language]) {
          loaded[t.language] = {
            summary: t.summary ?? '',
            description: t.description ?? '',
          }
        }
      }
    }
    setTranslations(loaded)
  }, [place])

  const saveMutation = useMutation({
    mutationFn: (data) => updateAdminPlace(id, {
      ...data,
      category_id: data.category_id ? Number(data.category_id) : undefined,
      lat: data.lat === '' ? null : Number(data.lat),
      lon: data.lon === '' ? null : Number(data.lon),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPlaces'] })
      queryClient.invalidateQueries({ queryKey: ['adminPlace', id] })
      addNotification({ type: 'success', message: 'Place updated' })
      navigate('/admin/places')
    },
    onError: (err) => {
      addNotification({ type: 'error', message: err.response?.data?.message || 'Update failed' })
    },
  })

  const categories = categoriesResponse ?? []

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const updateTranslation = (lang, field, value) =>
    setTranslations((prev) => ({
      ...prev,
      [lang]: { ...prev[lang], [field]: value },
    }))

  const handleSubmit = (e) => {
    e.preventDefault()
    saveMutation.mutate({ ...form, translations })
  }

  if (isLoading) {
    return <Skeleton className="h-96 w-full rounded-xl" />
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
            <CardTitle className="font-display text-xl">Edit place</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
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
            {saveMutation.isPending ? 'Saving...' : 'Save changes'}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link to="/admin/places">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
