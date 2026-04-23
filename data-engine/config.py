from dotenv import load_dotenv
import os

load_dotenv()

API_CATEGORIES_URL = os.getenv("API_CATEGORIES_URL")
API_PLACES_URL = os.getenv("API_PLACES_URL")
HEADERS = {
    "User-Agent": os.getenv("API_USER_AGENT"),
    "Accept": os.getenv("API_ACCEPT"),
    "Accept-Language": os.getenv("API_ACCEPT_LANGUAGE"),
    "Authorization": os.getenv("API_AUTHORIZATION"),
}

DB_HOST = os.getenv("DB_HOST")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_DATABASE = os.getenv("DB_DATABASE")