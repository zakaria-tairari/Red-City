export const CATEGORIES = [
  {
    id: 'restaurants',
    name: 'Restaurants',
    slug: 'restaurants',
    description: 'Moroccan feasts, rooftop dining, and world-class cuisine in the medina and beyond.',
    icon: 'UtensilsCrossed',
  },
  {
    id: 'hotels',
    name: 'Hotels',
    slug: 'hotels',
    description: 'Riads, luxury resorts, and boutique stays in the heart of the Red City.',
    icon: 'Hotel',
  },
  {
    id: 'cafes',
    name: 'Cafés',
    slug: 'cafes',
    description: 'Mint tea terraces, specialty coffee, and sun-drenched courtyard cafés.',
    icon: 'Coffee',
  },
  {
    id: 'bars-clubs',
    name: 'Bars & Clubs',
    slug: 'bars-clubs',
    description: 'Rooftop cocktails, live music, and Marrakech after dark.',
    icon: 'Wine',
  },
  {
    id: 'shopping',
    name: 'Shopping',
    slug: 'shopping',
    description: 'Souks, artisan cooperatives, and contemporary design boutiques.',
    icon: 'ShoppingBag',
  },
  {
    id: 'arts-culture',
    name: 'Arts & Culture',
    slug: 'arts-culture',
    description: 'Museums, galleries, palaces, and living heritage experiences.',
    icon: 'Palette',
  },
  {
    id: 'spas',
    name: 'Spas',
    slug: 'spas',
    description: 'Traditional hammams, wellness retreats, and indulgent spa rituals.',
    icon: 'Sparkles',
  },
  {
    id: 'activities',
    name: 'Activities',
    slug: 'activities',
    description: 'Desert excursions, cooking classes, and unforgettable adventures.',
    icon: 'Compass',
  },
]

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]))
