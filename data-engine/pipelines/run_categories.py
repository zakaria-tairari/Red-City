from scrapers.categories import fetch_categories
from processing.categories_cleaner import clean_categories
from db.categories_repo import insert_categories
from utils.logger import logger

def run_categories():
    logger.info("Starting categories pipeline...")
    logger.info("Scraping categories...")
    categories = fetch_categories()

    logger.info("Cleaning categories...")
    cleaned = clean_categories(categories)

    logger.info("Inserting categories...")
    insert_categories(cleaned)