def clean_category(category):
    return {
        "name": category.get("category", "").title().strip(),
        "code": category.get("slug", "").lower().strip()
    }

def clean_categories(categories):
    cleaned = [clean_category(category) for category in categories]

    return cleaned