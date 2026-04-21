import requests
from config import API_CATEGORIES_URL, HEADERS

def get_categories():
    response = requests.get(API_CATEGORIES_URL, headers=HEADERS)

    data = response.json()
    return data.get("data", [])