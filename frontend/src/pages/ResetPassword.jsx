import { useState, useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { resetPassword } from '@/services/auth'
import { getApiErrorMessage } from '@/lib/admin'
import { useUIStore } from '@/store/useUIStore'

export default function ResetPassword() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState({
    email: searchParams.get('email') ?? '',
    token: searchParams.get('token') ?? '',
    password: '',
    passwordConfirmation: '',
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const schema = useMemo(
    () =>
      z
        .object({
          email: z.string().email(t('validation.email')),
          token: z.string().min(1, t('validation.tokenMissing')),
          password: z.string().min(6, t('validation.passwordMin')),
          passwordConfirmation: z.string(),
        })
        .refine((data) => data.password === data.passwordConfirmation, {
          message: t('validation.passwordMismatch'),
          path: ['passwordConfirmation'],
        }),
    [t],
  )

  const update = (field) => (e) => setForm((current) => ({ ...current, [field]: e.target.value }))

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
    setIsSubmitting(true)

    try {
      await resetPassword(form)
      useUIStore.getState().addNotification({
        type: 'success',
        title: t('notifications.passwordUpdatedTitle'),
        message: t('notifications.passwordUpdatedMessage'),
      })
      navigate('/login')
    } catch (err) {
      useUIStore.getState().addNotification({
        type: 'error',
        title: t('notifications.resetFailedTitle'),
        message: getApiErrorMessage(err, t('notifications.resetPasswordFailedMessage')),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-stone-900">{t('resetPassword.title')}</h1>
      <p className="mt-2 text-stone-500">{t('resetPassword.subtitle')}</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <Label htmlFor="email">{t('resetPassword.email')}</Label>
          <Input id="email" type="email" value={form.email} onChange={update('email')} className="mt-1" />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>

        <input type="hidden" value={form.token} readOnly />
        {errors.token && <p className="text-sm text-red-600">{errors.token}</p>}

        <div>
          <Label htmlFor="password">{t('resetPassword.newPassword')}</Label>
          <Input id="password" type="password" value={form.password} onChange={update('password')} className="mt-1" />
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
        </div>

        <div>
          <Label htmlFor="passwordConfirmation">{t('resetPassword.confirmPassword')}</Label>
          <Input
            id="passwordConfirmation"
            type="password"
            value={form.passwordConfirmation}
            onChange={update('passwordConfirmation')}
            className="mt-1"
          />
          {errors.passwordConfirmation && (
            <p className="mt-1 text-sm text-red-600">{errors.passwordConfirmation}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> {t('resetPassword.submitting')}
            </>
          ) : (
            t('resetPassword.submit')
          )}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-stone-500">
        {t('resetPassword.needLink')}{' '}
        <Link to="/forgot-password" className="font-medium text-primary-600 hover:underline">
          {t('resetPassword.requestAnother')}
        </Link>
      </p>
    </div>
  )
}
