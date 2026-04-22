from scrapers.places import fetch_places_by_category
from processing.places_cleaner import clean_places
from db.categories_repo import get_categories
from db.places_repo import insert_places

def run_places():
    categories = get_categories()
    for category in categories:
        places = fetch_places_by_category(category["code"])
        cleaned = clean_places(places, category["id"])
        insert_places(cleaned)

run_places()