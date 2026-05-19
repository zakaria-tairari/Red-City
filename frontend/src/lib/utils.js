import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function delay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function formatReviewCount(count) {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`
  return String(count)
}

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function getPriceLabel(range) {
  const labels = { 1: '$', 2: '$$', 3: '$$$', 4: '$$$$' }
  return labels[range] || '$$'
}

export function getOpenStatus(hours) {
  const now = new Date()
  const day = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()]
  const today = hours?.[day]
  if (!today) return { isOpen: false, label: 'Hours unavailable' }
  if (today.closed) return { isOpen: false, label: 'Closed today' }
  const [openH, openM] = today.open.split(':').map(Number)
  const [closeH, closeM] = today.close.split(':').map(Number)
  const mins = now.getHours() * 60 + now.getMinutes()
  const openMins = openH * 60 + openM
  const closeMins = closeH * 60 + closeM
  const isOpen = mins >= openMins && mins < closeMins
  return {
    isOpen,
    label: isOpen ? `Open until ${today.close}` : `Opens at ${today.open}`,
  }
}

export function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
