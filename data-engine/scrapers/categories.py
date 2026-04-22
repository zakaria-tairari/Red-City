import requests
from config import API_CATEGORIES_URL, HEADERS

def fetch_categories():
    try:
        response = requests.get(API_CATEGORIES_URL, headers=HEADERS)

        data = response.json()
        return data.get("data", [])
    
    except Exception as e:
        print(f"Error fetching categories: {e}")