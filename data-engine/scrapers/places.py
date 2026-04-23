import requests
from config import API_PLACES_URL, HEADERS
from utils.logger import logger

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

        data = response.json().get("data", [])

        logger.info(f"Scraping successful: {len(data)} places scraped")
        return data
    
    except Exception as e:
        logger.error(f"Scraping failed: {e}")