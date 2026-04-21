from scrapers.categories import get_categories
from processing.categories_cleaner import clean_categories

def run_categories():
    categories = get_categories()
    clean = clean_categories(categories)
    print(clean)

run_categories()