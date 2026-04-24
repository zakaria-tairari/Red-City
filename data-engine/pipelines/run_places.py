from scrapers.places import fetch_places_by_category
from processing.places_cleaner import clean_places
from db.categories_repo import get_categories
from db.places_repo import insert_places, get_places_mapping
from processing.media_processor import extract_media
from db.media_repo import insert_media
from utils.logger import logger

def run_places():
    logger.info("Starting places pipeline...")
    categories = get_categories()

    for category in categories:
        logger.info(f"Scraping places for category {category["code"]}...")
        places = fetch_places_by_category(category["code"])

        logger.info("Cleaning places...")
        cleaned = clean_places(places, category["id"])

        logger.info("Inserting places...")
        insert_places(cleaned)

        logger.info("Mapping IDs...")
        mapping = get_places_mapping()

        all_media = []

        logger.info("scraping media from places...")
        for place in places:
            doc_id = place.get("documentId")
            place_id = mapping.get(doc_id)

            if not place_id:
                continue

            media = extract_media(place, place_id)
            all_media.extend(media)

        logger.info("Inserting media...")
        insert_media(all_media)

        logger.info("Pipeline execution successful")