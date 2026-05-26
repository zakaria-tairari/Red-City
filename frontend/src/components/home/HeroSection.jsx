import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useTranslation, Trans } from 'react-i18next'
import { useSearchStore } from '../../store/useSearchStore'

export default function HeroSection() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { setOpen } = useSearchStore()
  const [query, setQuery] = useState('')

  return (
    <section className="flex items-center justify-center bg-white">

      <div className="mx-auto max-w-3xl text-center px-4 mt-35 sm:px-6 lg:px-8 w-full">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-stone-800 max-w-4xl leading-tight text-balance"
        >
          <Trans i18nKey="hero.title" components={{ 1: <span className="text-primary-500" /> }} />
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="my-10 text-lg text-stone-500"
        >
          {t('hero.text')}
        </motion.p>

        <motion.button
          type="button"
          onClick={() => setOpen(true)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex items-center gap-3 mx-auto w-full max-w-2xl h-14 px-5 rounded-2xl bg-white shadow-sm border border-stone-200 text-stone-400 text-base hover:border-stone-300 hover:shadow-md transition-all duration-200 text-left"
        >
          <Search className="h-5 w-5 shrink-0 text-stone-400" />
          <span className="flex-1 truncate">{t('hero.search')}</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded bg-stone-100 px-1.5 py-0.5 text-[11px] text-stone-400 font-sans">
            ⌘+K
          </kbd>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 flex flex-wrap gap-4 items-center justify-center"
        >
          <Button size="lg" asChild>
            <Link to="/explore">{t('common.exploreBtn')}</Link>
          </Button>
          <Button variant="luxury" size="lg" asChild>
            <Link to="/register">{t('auth.createAccount')}</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}