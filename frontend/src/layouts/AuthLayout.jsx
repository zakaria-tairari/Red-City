import { Outlet, Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const AUTH_IMAGE ='/Login.jpg'

export default function AuthLayout() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:relative lg:block overflow-hidden">
        <img src={AUTH_IMAGE} alt="Marrakech" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-linear-to-b from-primary-500/10 via-stone-50/20 to-stone-900/60" />
        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="font-display text-2xl font-bold">Red City</span>
          </Link>
          <div>
            <h2 className="font-display text-4xl font-bold leading-tight">
              Your journey through Marrakech starts here
            </h2>
            <p className="mt-4 text-lg text-white/80 max-w-md">
              Save favorites, write reviews, and get personalized recommendations.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="lg:hidden inline-flex items-center gap-2 mb-8">
            <span className="font-display text-xl font-bold">Red City</span>
          </Link>
          <Outlet />
        </motion.div>
      </div>
    </div>
  )
}
