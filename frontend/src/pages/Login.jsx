import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Checkbox } from '@/components/ui/Checkbox'
import { Separator } from '@/components/ui/Separator'
import { useUIStore } from '@/store/useUIStore'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
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
    setLoading(true)
    // Template only — wire up your auth API here
    setTimeout(() => {
      setLoading(false)
      useUIStore.getState().addNotification({
        type: 'success',
        title: 'Welcome Back!',
        message: `Successfully logged in as ${email}. Experience Marrakech!`,
      })
      navigate('/dashboard')
    }, 600)
  }


  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-stone-900">Welcome back</h1>
      <p className="mt-2 text-stone-500">Sign in to continue exploring Marrakech</p>
      <p className="mt-1 text-xs text-stone-400">UI template — no auth backend connected</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1"
            placeholder="you@example.com"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <span className="text-sm text-stone-400">Forgot password? (template)</span>
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
          <Label htmlFor="remember" className="font-normal cursor-pointer">Remember me</Label>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</> : 'Sign in'}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <Separator className="flex-1" />
        <span className="text-xs text-stone-400">or continue with</span>
        <Separator className="flex-1" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" type="button">Google</Button>
        <Button variant="outline" type="button">Apple</Button>
      </div>

      <p className="mt-8 text-center text-sm text-stone-500">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-medium text-primary-600 hover:underline">
          Create one
        </Link>
      </p>
    </div>
  )
}
