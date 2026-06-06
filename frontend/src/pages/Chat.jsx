import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { Bot, Loader2, MapPin, Send, Trash2, User } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { sendChatMessage } from '@/services/chat'
import { cn } from '@/lib/utils'

const CHAT_STORAGE_KEY = 'red-city-chat-messages'
const WELCOME_MESSAGE_ID = 'welcome'

const getWelcomeMessage = () => ({
  id: WELCOME_MESSAGE_ID,
  role: 'assistant',
  content: '',
  places: [],
})

function normalizeMarkdown(content = '') {
  return content
    .replace(/```[\s\S]*?```/g, '')
    .split('\n')
    .map((line) => {
      if (/^\s*\|?[\s:-]+\|[\s|:-]*$/.test(line)) return ''
      if ((line.match(/\|/g) || []).length >= 2) {
        const cells = line
          .trim()
          .replace(/^\|/, '')
          .replace(/\|$/, '')
          .split('|')
          .map((cell) => cell.trim())
          .filter(Boolean)

        return cells.length ? `- ${cells.join(' - ')}` : ''
      }

      return line
    })
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function ChatBubble({ message, t }) {
  const isUser = message.role === 'user'
  const isWelcome = message.id === WELCOME_MESSAGE_ID
  const rawContent = isWelcome ? t('chat.welcome') : message.content
  const content = isUser ? rawContent : normalizeMarkdown(rawContent)

  return (
    <div className={cn('flex gap-2 sm:gap-3', isUser && 'justify-end')}>
      {!isUser && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white sm:h-9 sm:w-9">
          <Bot className="h-4 w-4" />
        </div>
      )}

      <div className={cn('min-w-0 max-w-[82%] sm:max-w-2xl', isUser && 'order-first')}>
        <div
          className={cn(
            'overflow-hidden px-4 py-3 text-sm shadow-sm',
            isUser
              ? 'rounded-2xl rounded-tr-md bg-primary-600 text-white'
              : 'rounded-2xl rounded-tl-md border border-stone-200 bg-white text-stone-800'
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap wrap-break-word leading-6">{content}</p>
          ) : (
            <div className="chat-markdown markdown-content max-w-none wrap-break-word">
              <ReactMarkdown
                disallowedElements={['table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'pre', 'code']}
                unwrapDisallowed
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {!isUser && message.places?.length > 0 && (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {message.places.slice(0, 4).map((place) => (
              <Link
                key={place.id}
                to={`/places/${place.id}`}
                className="rounded-xl border border-stone-200 bg-white p-3 text-sm shadow-sm transition hover:border-primary-200 hover:bg-primary-50/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-stone-900">{place.name}</p>
                    <p className="mt-1 truncate text-xs text-stone-500">
                      {place.category?.name || 'Marrakech'} · {Number(place.avg_rating || 0).toFixed(1)} {t('chat.rating')}
                    </p>
                  </div>
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {isUser && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-900 text-white sm:h-9 sm:w-9">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  )
}

export default function Chat() {
  const { t } = useTranslation()
  const welcomeMessage = useMemo(() => getWelcomeMessage(), [])
  const suggestions = useMemo(
    () => [
      t('chat.suggestions.photography'),
      t('chat.suggestions.culture'),
      t('chat.suggestions.relax'),
      t('chat.suggestions.food'),
    ],
    [t]
  )

  const [messages, setMessages] = useState(() => {
    try {
      const saved = window.localStorage.getItem(CHAT_STORAGE_KEY)
      const parsed = saved ? JSON.parse(saved) : null
      return Array.isArray(parsed) && parsed.length ? parsed : [welcomeMessage]
    } catch {
      return [welcomeMessage]
    }
  })
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  const canSubmit = useMemo(() => input.trim().length > 1 && !isLoading, [input, isLoading])

  useEffect(() => {
    window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages))
  }, [messages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isLoading])

  const submitMessage = async (value = input) => {
    const message = value.trim()
    if (!message || isLoading) return

    setInput('')
    setError('')
    setMessages((current) => [...current, { role: 'user', content: message }])
    setIsLoading(true)

    try {
      const response = await sendChatMessage(message)
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: response.answer,
          places: response.places ?? [],
        },
      ])
    } catch (err) {
      const fallback = err?.response?.data?.message || err?.message || 'Could not generate a response.'
      setError(fallback)
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: t('chat.errorMessage'),
          places: [],
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    submitMessage()
  }

  return (
    <div className="min-h-screen bg-stone-50 pt-16">
      <section className="mx-auto flex min-h-[calc(80vh)] max-w-5xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <div className="mb-6 mt-2 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-bold text-stone-950 sm:text-3xl">
              {t('chat.title')}
            </h1>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setMessages([welcomeMessage])
              setError('')
            }}
            aria-label={t('chat.clear')}
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">{t('chat.clear')}</span>
          </Button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-stone-200 bg-white shadow-sm">
          <div className="flex-1 space-y-5 overflow-y-auto px-3 py-4 sm:px-5">
            {messages.map((message, index) => (
              <motion.div
                key={`${message.role}-${index}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChatBubble
                  message={
                    index === 0 && message.role === 'assistant'
                      ? { ...message, id: message.id ?? WELCOME_MESSAGE_ID }
                      : message
                  }
                  t={t}
                />
              </motion.div>
            ))}

            {isLoading && (
              <div className="flex gap-2 sm:gap-3">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white sm:h-9 sm:w-9">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2 rounded-2xl rounded-tl-md border border-stone-200 bg-white px-4 py-3 text-sm text-stone-500 shadow-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-primary-600" />
                  {t('chat.thinking')}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {error && (
            <div className="border-t border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700 sm:px-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="border-t border-stone-200 p-3 sm:p-4">
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => submitMessage(suggestion)}
                  disabled={isLoading}
                  className="shrink-0 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-600 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 disabled:opacity-60"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <div className="flex items-end gap-2 rounded-full border border-stone-200 bg-stone-50 p-2 focus-within:border-primary-300 focus-within:bg-white">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    submitMessage()
                  }
                }}
                rows={1}
                placeholder={t('chat.placeholder')}
                className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-3 py-2 text-sm leading-6 text-stone-900 outline-none placeholder:text-stone-400"
              />
              <Button type="submit" size="icon" disabled={!canSubmit} aria-label={t('chat.send')}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}
