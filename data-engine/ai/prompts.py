TAXONOMY = {
    "general": ["touristic", "local_spot", "hidden_gem", "city_center", "old_medina", "luxury", "premium", "mid_range", "budget_friendly", "romantic",
                 "family_friendly", "solo_friendly", "group_friendly", "aesthetic", "cozy", "calm", "lively", "live_music"
                 "modern", "traditional", "authentic", "artistic", "trendy", "quiet", "noisy", "energetic"
               ],
    1: ["nightlife", "bar", "nightclub", "lounge", "rooftop_bar", "dj_music", "electronic_music", "techno", "dance_floor",
        "party", "dancing", "social", "late_night"],
    2: ["moroccan_cuisine", "french_cuisine", "italian_cuisine", "asian_cuisine", "mediterranean_cuisine", "fusion_cuisine", "street_food",
        "fine_dining", "casual_dining", "bistronomy", "fast_food", "rooftop", "panoramic_view", "terrace_dining", "live_entertainment",
       ],
    3: ["excursion", "adventure", "workshop", "experience", "golf", "yoga", "desert_trip", "camel_ride", "hiking", "quad_biking"],
    4: ["mall", "boutique", "souk", "artisan_shop", "concept_store", "fashion", "handmade", "local_crafts", "jewelry", "textiles", "decor"],
    5: ["museum", "art_gallery", "cultural_center", "historical_site", "educational", "cultural_show", "traditional_art", "photography", "heritage"],
    6: ["spa", "hammam", "massage_center", "wellness_center", "traditional_hammam", "aromatherapy", "massage", "hot_stone", "facials", "skincare"],
    7: ["hotel", "resort", "riad", "hostel", "pool"],
    8: ["cafe", "specialty_coffee", "tea_house", "study_friendly", "work_friendly", "artisan_coffee", "desserts", "brunch", "pastries"],
}

def build_tags_prompt(places, category_id):
    allowed_tags = TAXONOMY["general"] + TAXONOMY.get(category_id, [])
    formatted_places = "\n\n".join([
        f"ID: {p['id']}\nSUMMARY: {p['summary']}"
        for p in places
    ])

    return f"""
    You are a strict tagging system.

    ONLY use the following tags:
    {", ".join(allowed_tags)}

    You will receive multiple places.
    For each place, assign 5-10 relevant tags with confidence scores.

    Return ONLY valid JSON in this format:
    [
    {{
        "id": 1,
        "tags": [
        {{"tag": "rooftop", "score": 0.9}},
        {{"tag": "luxury", "score": 0.8}}
        ]
    }}
    ]

    Rules:
    - Do NOT invent new tags
    - Use ONLY exact matches from the list
    - Every place must include its ID

    Places:
    {formatted_places}
    """