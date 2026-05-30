import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Checkbox } from '@/components/ui/Checkbox'
import { useUIStore } from '@/store/useUIStore'
import { useAuthStore } from '@/store/useAuthStore'

export default function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [errors, setErrors] = useState({})

  const schema = useMemo(
    () =>
      z.object({
        email: z.string().email(t('validation.email')),
        password: z.string().min(6, t('validation.passwordMin')),
      }),
    [t],
  )

  const { login, isLoading } = useAuthStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = schema.safeParse({ email, password })
    if (!result.success) {
      const fieldErrors = {}
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message
      })
      setErrors(fieldErrors)
      return
    }
    setErrors({})

    const response = await login({ email, password })

    if (response.success) {
      useUIStore.getState().addNotification({
        type: 'success',
        title: t('notifications.welcomeBackTitle'),
        message: t('notifications.welcomeBackMessage'),
      })
      navigate('/dashboard')
    } else {
      if (response.error === 'Email not verified') {
        useUIStore.getState().addNotification({
          type: 'warning',
          title: t('notifications.emailNotVerifiedTitle'),
          message: t('notifications.emailNotVerifiedMessage'),
        })
        navigate('/verify-email', { state: { email } })
      } else {
        useUIStore.getState().addNotification({
          type: 'error',
          title: t('notifications.loginFailedTitle'),
          message: response.error || t('notifications.loginFailedMessage'),
        })
      }
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-stone-900">{t('login.title')}</h1>
      <p className="mt-2 text-stone-500">{t('login.subtitle')}</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <Label htmlFor="email">{t('login.email')}</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1"
            placeholder={t('common.emailPlaceholder')}
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t('login.password')}</Label>
            <Link to="/forgot-password" className="text-sm font-medium text-primary-600 hover:underline">
              {t('login.forgotPassword')}
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1"
          />
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
        </div>

        <div className="flex items-center gap-2">
          <Checkbox id="remember" checked={remember} onCheckedChange={setRemember} />
          <Label htmlFor="remember" className="font-normal cursor-pointer">{t('login.rememberMe')}</Label>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> {t('login.submitting')}
            </>
          ) : (
            t('login.submit')
          )}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-stone-500">
        {t('login.noAccount')}{' '}
        <Link to="/register" className="font-medium text-primary-600 hover:underline">
          {t('login.createOne')}
        </Link>
      </p>
    </div>
  )
}
