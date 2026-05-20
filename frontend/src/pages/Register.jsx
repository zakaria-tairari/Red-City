import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Checkbox } from '@/components/ui/Checkbox'
import { Progress } from '@/components/ui/Progress'
import { useUIStore } from '@/store/useUIStore'

const schema = z
  .object({
    firstName: z.string().min(1, 'Required'),
    lastName: z.string().min(1, 'Required'),
    username: z.string().min(3, 'At least 3 characters'),
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'At least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

function passwordStrength(password) {
  let score = 0
  if (password.length >= 8) score += 25
  if (/[A-Z]/.test(password)) score += 25
  if (/[0-9]/.test(password)) score += 25
  if (/[^A-Za-z0-9]/.test(password)) score += 25
  return score
}

export default function Register() {
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
  const [loading, setLoading] = useState(false)

  const strength = useMemo(() => passwordStrength(form.password), [form.password])

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = (e) => {
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
    setLoading(true)
    // Template only — wire up your auth API here
    setTimeout(() => {
      setLoading(false)
      useUIStore.getState().addNotification({
        type: 'success',
        title: 'Account Created!',
        message: `Welcome, ${form.firstName}! A verification link has been sent to ${form.email}.`,
      })
      navigate('/verify-email')
    }, 600)
  }


  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-stone-900">Create account</h1>
      <p className="mt-2 text-stone-500">Join Red City and discover Marrakech</p>
      <p className="mt-1 text-xs text-stone-400">UI template — no auth backend connected</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First name</Label>
            <Input id="firstName" value={form.firstName} onChange={update('firstName')} className="mt-1" />
            {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
          </div>
          <div>
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" value={form.lastName} onChange={update('lastName')} className="mt-1" />
            {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
          </div>
        </div>
        <div>
          <Label htmlFor="username">Username</Label>
          <Input id="username" value={form.username} onChange={update('username')} className="mt-1" />
          {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={form.email} onChange={update('email')} className="mt-1" />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={form.password} onChange={update('password')} className="mt-1" />
          {form.password && (
            <div className="mt-2">
              <Progress value={strength} className="h-1.5" />
              <p className="mt-1 text-xs text-stone-400">
                {strength < 50 ? 'Weak' : strength < 75 ? 'Good' : 'Strong'} password
              </p>
            </div>
          )}
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input id="confirmPassword" type="password" value={form.confirmPassword} onChange={update('confirmPassword')} className="mt-1" />
          {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
        </div>

        <div className="flex items-center gap-2">
          <Checkbox id="remember" checked={remember} onCheckedChange={setRemember} />
          <Label htmlFor="remember" className="font-normal cursor-pointer">Remember me</Label>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account...</> : 'Create account'}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-stone-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary-600 hover:underline">Sign in</Link>
      </p>
    </div>
  )
}
