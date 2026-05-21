import api from '@/lib/api'

export async function fetchCategories() {
    const response = await api.get("/api/categories");
    return response.data;
}