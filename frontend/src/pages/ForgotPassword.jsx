import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { forgotPassword } from '@/services/auth'
import { getApiErrorMessage } from '@/lib/admin'
import { useUIStore } from '@/store/useUIStore'

export default function ForgotPassword() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const schema = useMemo(
    () => z.object({ email: z.string().email(t('validation.email')) }),
    [t],
  )

  const handleSubmit = async (e) => {
    e.preventDefault()

    const result = schema.safeParse({ email })
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? t('validation.email'))
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      await forgotPassword(email)
      setSent(true)
      useUIStore.getState().addNotification({
        type: 'success',
        title: t('notifications.checkEmailTitle'),
        message: t('notifications.checkEmailMessage'),
      })
    } catch (err) {
      useUIStore.getState().addNotification({
        type: 'error',
        title: t('notifications.resetFailedTitle'),
        message: getApiErrorMessage(err, t('notifications.resetSendFailedMessage')),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-stone-900">{t('forgotPassword.title')}</h1>
      <p className="mt-2 text-stone-500">{t('forgotPassword.subtitle')}</p>

      {sent ? (
        <div className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          {t('forgotPassword.sentMessage', { email })}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <Label htmlFor="email">{t('forgotPassword.email')}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
              placeholder={t('common.emailPlaceholder')}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> {t('forgotPassword.submitting')}
              </>
            ) : (
              t('forgotPassword.submit')
            )}
          </Button>
        </form>
      )}

      <p className="mt-8 text-center text-sm text-stone-500">
        {t('forgotPassword.remembered')}{' '}
        <Link to="/login" className="font-medium text-primary-600 hover:underline">
          {t('auth.login')}
        </Link>
      </p>
    </div>
  )
}
