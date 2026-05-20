import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'
import { useUIStore } from '@/store/useUIStore'

/**
 * ToastContainer Component
 * Displays a stack of animated, floating alerts in the top-right corner of the screen.
 * Automatically dismissed after 4 seconds.
 */
export default function ToastContainer() {
  const { notifications, removeNotification } = useUIStore()

  return (
    <div className="fixed top-20 right-4 z-50 flex w-full max-w-sm flex-col gap-3 pointer-events-none sm:right-6 sm:top-24">
      <AnimatePresence>
        {notifications.map((n) => (
          <ToastItem
            key={n.id}
            notification={n}
            onClose={() => removeNotification(n.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

function ToastItem({ notification, onClose }) {
  const { id, type = 'success', title, message } = notification

  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />,
    warning: <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />,
    info: <Info className="h-5 w-5 text-sky-500 shrink-0" />,
  }

  const borders = {
    success: 'border-emerald-100 shadow-emerald-100',
    error: 'border-red-100 shadow-red-100',
    warning: 'border-amber-100 shadow-amber-100',
    info: 'border-sky-100 shadow-sky-100',
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
      className={`pointer-events-auto flex items-start gap-3 rounded-2xl bg-white border p-4 shadow-lg ${borders[type]}`}
    >
      {icons[type] || icons.info}
      
      <div className="min-w-0 flex-1">
        {title && (
          <h4 className="font-serif font-semibold text-stone-900 text-sm leading-5">
            {title}
          </h4>
        )}
        <p className="text-stone-500 text-xs mt-0.5 leading-normal">
          {message}
        </p>
      </div>

      <button
        onClick={onClose}
        className="rounded-lg p-1 text-stone-400 hover:bg-stone-50 hover:text-stone-600 transition-colors shrink-0"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  )
}
