const REVIEWERS = [
  { name: 'Sarah Mitchell', avatar: 'SM', country: 'UK' },
  { name: 'James Chen', avatar: 'JC', country: 'USA' },
  { name: 'Amélie Dubois', avatar: 'AD', country: 'France' },
  { name: 'Marco Rossi', avatar: 'MR', country: 'Italy' },
  { name: 'Yuki Tanaka', avatar: 'YT', country: 'Japan' },
  { name: 'Fatima El Amrani', avatar: 'FA', country: 'Morocco' },
  { name: 'Oliver Schmidt', avatar: 'OS', country: 'Germany' },
  { name: 'Emma Williams', avatar: 'EW', country: 'Australia' },
]

const TITLES = [
  'Absolutely magical',
  'A must-visit in Marrakech',
  'Exceeded all expectations',
  'Perfect experience',
  'Hidden gem',
  'Worth every dirham',
  'Unforgettable',
  'Will definitely return',
]

const BODIES = [
  'This place captured the essence of Marrakech perfectly. The atmosphere, service, and attention to detail were outstanding. We felt welcomed from the moment we arrived.',
  'We visited during our honeymoon and it was the highlight of our trip. The setting is breathtaking and the staff went above and beyond to make us feel special.',
  'As a local, I can say this is one of the best spots in the city. Authentic without being touristy. The quality is consistently excellent.',
  'The photos don\'t do it justice. Every corner reveals something beautiful. We spent hours here and could have stayed longer.',
  'Great value for the quality. Book ahead during peak season — we walked in on a quiet Tuesday and had no wait.',
  'The sunset views alone are worth the visit. Combined with excellent food and warm hospitality, this is a 10/10 experience.',
  'We\'ve traveled extensively and this ranks among our top experiences worldwide. Don\'t miss it.',
  'Minor wait at peak hours but completely worth it. The team was apologetic and offered complimentary mint tea while we waited.',
]

const REVIEW_IMAGES = [
  'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80',
]

function seededRandom(seed) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

export function generateReviewsForPlace(placeId, count = 12) {
  const reviews = []
  for (let i = 0; i < count; i++) {
    const seed = parseInt(placeId, 10) * 100 + i
    const reviewer = REVIEWERS[Math.floor(seededRandom(seed) * REVIEWERS.length)]
    const rating = seededRandom(seed + 1) > 0.15 ? (seededRandom(seed + 2) > 0.5 ? 5 : 4) : 3
    const hasImage = seededRandom(seed + 3) > 0.6
    reviews.push({
      id: `${placeId}-review-${i}`,
      placeId,
      author: reviewer,
      rating,
      title: TITLES[Math.floor(seededRandom(seed + 4) * TITLES.length)],
      body: BODIES[Math.floor(seededRandom(seed + 5) * BODIES.length)],
      date: new Date(2025, Math.floor(seededRandom(seed + 6) * 12), Math.floor(seededRandom(seed + 7) * 28) + 1).toISOString(),
      helpful: Math.floor(seededRandom(seed + 8) * 48),
      images: hasImage ? [REVIEW_IMAGES[Math.floor(seededRandom(seed + 9) * REVIEW_IMAGES.length)]] : [],
      verified: seededRandom(seed + 10) > 0.3,
    })
  }
  return reviews.sort((a, b) => new Date(b.date) - new Date(a.date))
}

export function getRatingBreakdown(reviews) {
  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  reviews.forEach((r) => {
    breakdown[r.rating] = (breakdown[r.rating] || 0) + 1
  })
  const total = reviews.length
  return Object.entries(breakdown).map(([stars, count]) => ({
    stars: Number(stars),
    count,
    percent: total ? Math.round((count / total) * 100) : 0,
  }))
}
