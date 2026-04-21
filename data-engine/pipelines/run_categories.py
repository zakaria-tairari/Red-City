from scrapers.categories import get_categories
from processing.categories_cleaner import clean_categories
from db.categories_repo import insert_categories

def run_categories():
    categories = get_categories()
    cleaned = clean_categories(categories)
    insert_categories(cleaned)

run_categories()