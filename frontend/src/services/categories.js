import api from '@/lib/api'

const CATEGORY_ORDER = {
  restaurants: 1,
  hotels: 2,
  cafes: 3,
  "arts-culture": 4,
  activities: 5,
  shopping: 6,
  "bars-nightlife": 7,
  spas: 8,
};

export async function fetchCategories() {
    const response = await api.get("/api/categories");
    const categories = response.data;

    const sorted = [...categories].sort(
    (a, b) => (CATEGORY_ORDER[a.code] ?? 999) - (CATEGORY_ORDER[b.code] ?? 999)
    );
    return sorted;
}