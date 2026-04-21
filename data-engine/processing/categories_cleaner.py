def clean_category(category):
    return {
        "name": category.get("category", "").title().strip(),
        "code": category.get("slug", "").lower().strip()
    }

def clean_categories(categories):
    cleaned = []

    for category in categories:
        cleaned.append(clean_category(category))

    return cleaned