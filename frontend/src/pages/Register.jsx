import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Checkbox } from '@/components/ui/Checkbox'
import { Progress } from '@/components/ui/Progress'
import { useUIStore } from '@/store/useUIStore'
import { useAuthStore } from '@/store/useAuthStore'

function passwordStrength(password) {
  let score = 0
  if (password.length >= 8) score += 25
  if (/[A-Z]/.test(password)) score += 25
  if (/[0-9]/.test(password)) score += 25
  if (/[^A-Za-z0-9]/.test(password)) score += 25
  return score
}

export default function Register() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [remember, setRemember] = useState(false)
  const [errors, setErrors] = useState({})

  const schema = useMemo(
    () =>
      z
        .object({
          firstName: z.string().min(1, t('validation.required')),
          lastName: z.string().min(1, t('validation.required')),
          username: z.string().min(3, t('validation.usernameMin')),
          email: z.string().email(t('validation.invalidEmail')),
          password: z.string().min(6, t('validation.passwordMinRegister')),
          confirmPassword: z.string(),
        })
        .refine((d) => d.password === d.confirmPassword, {
          message: t('validation.passwordMismatch'),
          path: ['confirmPassword'],
        }),
    [t],
  )

  const { register, isLoading } = useAuthStore()

  const strength = useMemo(() => passwordStrength(form.password), [form.password])

  const strengthLabel =
    strength < 50
      ? t('register.passwordWeak')
      : strength < 75
        ? t('register.passwordGood')
        : t('register.passwordStrong')

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = schema.safeParse(form)
    if (!result.success) {
      const fieldErrors = {}
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message
      })
      setErrors(fieldErrors)
      return
    }
    setErrors({})

    const response = await register({
      firstName: form.firstName,
      lastName: form.lastName,
      username: form.username,
      email: form.email,
      password: form.password,
      passwordConfirmation: form.confirmPassword,
    })

    if (response.success) {
      useUIStore.getState().addNotification({
        type: 'success',
        title: t('notifications.accountCreatedTitle'),
        message: t('notifications.accountCreatedMessage', {
          name: form.firstName,
          email: form.email,
        }),
      })
      navigate('/verify-email', { state: { email: form.email } })
    } else {
      useUIStore.getState().addNotification({
        type: 'error',
        title: t('notifications.registrationFailedTitle'),
        message: response.error || t('notifications.registrationFailedMessage'),
      })
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-stone-900">{t('register.title')}</h1>
      <p className="mt-2 text-stone-500">{t('register.subtitle')}</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">{t('register.firstName')}</Label>
            <Input id="firstName" value={form.firstName} onChange={update('firstName')} className="mt-1" />
            {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
          </div>
          <div>
            <Label htmlFor="lastName">{t('register.lastName')}</Label>
            <Input id="lastName" value={form.lastName} onChange={update('lastName')} className="mt-1" />
            {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
          </div>
        </div>
        <div>
          <Label htmlFor="username">{t('register.username')}</Label>
          <Input id="username" value={form.username} onChange={update('username')} className="mt-1" />
          {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
        </div>
        <div>
          <Label htmlFor="email">{t('register.email')}</Label>
          <Input id="email" type="email" value={form.email} onChange={update('email')} className="mt-1" />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>
        <div>
          <Label htmlFor="password">{t('register.password')}</Label>
          <Input id="password" type="password" value={form.password} onChange={update('password')} className="mt-1" />
          {form.password && (
            <div className="mt-2">
              <Progress value={strength} className="h-1.5" />
              <p className="mt-1 text-xs text-stone-400">
                {t('register.passwordStrength', { strength: strengthLabel })}
              </p>
            </div>
          )}
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
        </div>
        <div>
          <Label htmlFor="confirmPassword">{t('register.confirmPassword')}</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={update('confirmPassword')}
            className="mt-1"
          />
          {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
        </div>

        <div className="flex items-center gap-2">
          <Checkbox id="remember" checked={remember} onCheckedChange={setRemember} />
          <Label htmlFor="remember" className="font-normal cursor-pointer">{t('register.rememberMe')}</Label>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> {t('register.submitting')}
            </>
          ) : (
            t('register.submit')
          )}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-stone-500">
        {t('register.hasAccount')}{' '}
        <Link to="/login" className="font-medium text-primary-600 hover:underline">
          {t('auth.login')}
        </Link>
      </p>
    </div>
  )
}
