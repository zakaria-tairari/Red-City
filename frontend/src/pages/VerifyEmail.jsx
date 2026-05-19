import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Loader2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const DEMO_EMAIL = 'you@example.com'

export default function VerifyEmail() {
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')

  const handleResend = () => {
    setStatus('loading')
    // Template only — wire up your auth API here
    setTimeout(() => {
      setStatus('success')
      setMessage('Verification email sent (demo)')
    }, 600)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-stone-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
              <Mail className="h-8 w-8 text-primary-600" />
            </div>
            <CardTitle className="font-display text-2xl">Verify your email</CardTitle>
            <CardDescription>
              We sent a verification link to{' '}
              <strong className="text-stone-700">{DEMO_EMAIL}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-stone-500 text-center">
              UI template — no auth backend connected.
            </p>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleResend}
              disabled={status === 'loading'}
            >
              {status === 'loading' ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</>
              ) : (
                'Resend verification email'
              )}
            </Button>

            {status === 'success' && (
              <p className="flex items-center justify-center gap-2 text-sm text-emerald-600">
                <CheckCircle className="h-4 w-4" /> {message}
              </p>
            )}

            <Button asChild className="w-full">
              <Link to="/dashboard">Continue to dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
