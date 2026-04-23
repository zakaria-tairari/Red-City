from scrapers.places import fetch_places_by_category
from processing.places_cleaner import clean_places
from db.categories_repo import get_categories
from db.places_repo import insert_places
from utils.logger import logger

def run_places():
    logger.info("Starting places pipeline...")
    categories = get_categories()

    for category in categories:
        logger.info(f"Scraping places for category {category["code"]}...")
        places = fetch_places_by_category(category["code"])

        logger.info(f"Cleaning places...")
        cleaned = clean_places(places, category["id"])

        logger.info(f"Inserting places...")
        insert_places(cleaned)

run_places()