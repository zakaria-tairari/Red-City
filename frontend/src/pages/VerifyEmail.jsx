import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Loader2, Mail, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { useAuthStore } from '@/store/useAuthStore'

export default function VerifyEmail() {
  const location = useLocation()
  const email = location.state?.email || 'your email address'
  
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  
  const { resendVerification } = useAuthStore()

  const handleResend = async () => {
    setStatus('loading')
    setError('')
    setMessage('')
    
    if (email === 'your email address') {
      setStatus('error')
      setError('Email address not found. Please log in again.')
      return
    }

    const response = await resendVerification(email)
    
    if (response.success) {
      setStatus('success')
      setMessage(response.message || 'Verification email sent')
    } else {
      setStatus('error')
      setError(response.error || 'Failed to resend email')
    }
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
              <strong className="text-stone-700">{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">

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

            {status === 'error' && (
              <p className="flex items-center justify-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" /> {error}
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
