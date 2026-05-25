import requests
from db.places_repo import get_places_by_category
from db.categories_repo import get_categories
from db.translations_repo import insert_translation, set_translated
from config import OPENTRANSLATE_URL
from utils.logger import logger
import re

TARGET_LANGUAGES = ['en', 'es']

def translate(text, lang):
    payload = {
        "q": text,
        "source": "fr",
        "target": lang,
        "format": "text",
    }
    headers = {
        "Content-Type": "application/json"
    }

    response = requests.post(OPENTRANSLATE_URL, json=payload, headers=headers)
    data = response.json()
    return data.get("translatedText", None)

def normalize_markdown(text):
    # Fix headings
    text = re.sub(r'^(#{1,6})([^\s#])', r'\1 \2', text, flags=re.MULTILINE)
    # Fix missing line breaks before headings
    text = re.sub(r'\n(#{1,6})', r'\n\n\1', text)
    # Normalize multiple spaces
    text = re.sub(r'[ \t]+', ' ', text)
    # Fix list spacing issues
    text = re.sub(r'\n\s*-\s*', '\n- ', text)
    # 5. Ensure clean line breaks
    text = re.sub(r'\n{3,}', '\n\n', text)

    return text.strip()

def translate_places():
    categories = get_categories()

    for category in categories:
        places = get_places_by_category(category["id"], only_untranslated=True)
        logger.info(f"Generating translations for category {category['code']}...")

        for place in places:
            place_id = place["id"]
            summary = place.get("summary", "")
            description = place.get("description", "")

            success = True

            for lang in TARGET_LANGUAGES:
                try:
                    summary_tr = translate(summary, lang)
                    description_tr = translate(description, lang)

                    translation = {
                        "place_id": place_id,
                        "language": lang,
                        "summary": normalize_markdown(summary_tr),
                        "description": normalize_markdown(description_tr)
                    }

                    insert_translation(translation)

                except Exception as e:
                    logger.error(
                        f"Translations failed for place {place_id} lang {lang}: {e}"
                    )
                    success = False
                    break

            if success:
                set_translated(place_id)
                logger.info(f"Translations completed for place {place_id}")