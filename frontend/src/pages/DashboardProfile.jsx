import { useState } from 'react'
import { User, Save, CheckCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { useAuthStore } from '@/store/useAuthStore'
import { useUIStore } from '@/store/useUIStore'
import * as authService from '@/services/auth'

export default function DashboardProfile() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    username: user?.username || '',
  })

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await authService.updateProfile(form)
      if (response.success) {
        useAuthStore.setState({ user: response.data })
        useUIStore.getState().addNotification({
          type: 'success',
          title: t('notifications.profileUpdatedTitle'),
          message: t('notifications.profileUpdatedMessage'),
        })
      } else {
        useUIStore.getState().addNotification({
          type: 'error',
          title: t('notifications.updateFailedTitle'),
          message: response.message || t('notifications.updateFailedMessage'),
        })
      }
    } catch (error) {
      const errors = error.response?.data?.errors
      const message = errors
        ? Object.values(errors).flat().join(' ')
        : error.response?.data?.message || t('notifications.profileUpdateFailedMessage')
      useUIStore.getState().addNotification({
        type: 'error',
        title: t('notifications.updateFailedTitle'),
        message,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h2 className="font-display text-2xl font-bold text-stone-900 mb-6">{t('dashboard.myProfile')}</h2>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-primary-600">
              <User className="h-8 w-8" />
            </div>
            <div>
              <CardTitle className="font-serif text-xl">
                {user?.first_name} {user?.last_name}
              </CardTitle>
              <p className="text-sm text-stone-500">{user?.email}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="first_name">{t('dashboard.firstName')}</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="last_name">{t('dashboard.lastName')}</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  className="mt-1"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="username">{t('dashboard.username')}</Label>
              <Input
                id="username"
                name="username"
                value={form.username}
                onChange={handleChange}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">{t('dashboard.email')}</Label>
              <Input
                id="email"
                name="email"
                value={user?.email || ''}
                disabled
                className="mt-1 bg-stone-100 text-stone-500 cursor-not-allowed"
              />
              <p className="text-xs text-stone-400 mt-1 flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-emerald-500" /> {t('dashboard.verifiedEmail')}
              </p>
            </div>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              <Save className="h-4 w-4" />
              {isSubmitting ? t('dashboard.saving') : t('dashboard.saveChanges')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
