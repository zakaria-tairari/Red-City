import requests
from config import API_PLACES_URL, HEADERS

def fetch_places_by_category(category_code, locale="fr", page=1, page_size=300):
    try:
        response = requests.get(API_PLACES_URL, headers=HEADERS, params = {
        "locale": locale,
        "filters[city][slug][$eq]": "marrakech",
        "filters[categories][slug][$eq]": category_code,
        "pagination[page]": page,
        "pagination[pageSize]": page_size,
        "populate[0]": "gallery",
        "populate[1]": "coverImage",
        "populate[2]": "videos",
        })

        data = response.json()
        return data.get("data", [])
    
    except Exception as e:
        print(f"Error fetching places: {e}")