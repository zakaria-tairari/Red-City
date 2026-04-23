import requests
from config import API_CATEGORIES_URL, HEADERS
from utils.logger import logger

def fetch_categories():
    try:
        response = requests.get(API_CATEGORIES_URL, headers=HEADERS)

        data = response.json().get("data", [])

        logger.info(f"Scraping successful: {len(data)} categories scraped")
        return data
    
    except Exception as e:
        logger.error(f"Scraping failed: {e}")