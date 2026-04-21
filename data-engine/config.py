from dotenv import load_dotenv
import os

load_dotenv()

API_CATEGORIES_URL = os.getenv("API_CATEGORIES_URL")

HEADERS = {
    "User-Agent": os.getenv("API_USER_AGENT"),
    "Accept": os.getenv("API_ACCEPT"),
    "Accept-Language": os.getenv("API_ACCEPT_LANGUAGE"),
    "Authorization": os.getenv("API_AUTHORIZATION"),
}