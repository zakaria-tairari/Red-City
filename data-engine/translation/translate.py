import requests
from db.places_repo import get_places_by_category
from db.categories_repo import get_categories
from db.translations_repo import insert_translations
from config import OPENTRANSLATE_URL
from utils.logger import logger

def translate(text, source, target):
    payload = {
        "q": text,
        "source": source,
        "target": target,
        "format": "text",
    }
    headers = {
        "Content-Type": "application/json"
    }

    response = requests.post(OPENTRANSLATE_URL, json=payload, headers=headers)
    return response.json()["translatedText"]

def translate_places():
    categories = get_categories()

    for category in categories:
        logger.info(f"Generating translations for category {category["code"]}...")
        places = get_places_by_category(category["id"])
        translations = []

        for place in places:
            try:
                place_id = place["id"]
                summary_fr = place.get("summary", "")
                description_fr = place.get("description", "")

                summary_en = translate(summary_fr, "fr", "en")
                description_en = translate(description_fr, "fr", "en")

                translations.append({
                    "place_id": place_id,
                    "language": "en",
                    "summary": summary_en,
                    "description": description_en
                })

                summary_ar = translate(summary_en, "en", "ar")
                description_ar = translate(description_en, "en", "ar")

                translations.append({
                    "place_id": place_id,
                    "language": "ar",
                    "summary": summary_ar,
                    "description": description_ar
                })

            except Exception as e:
                logger.error(f"Translation failed for place {place_id}: {e}")

        if translations:
            insert_translations(translations)