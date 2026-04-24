def extract_media(place, place_id):
    media = []

    cover = place.get("coverImage")
    gallery = place.get("gallery", []) or []
    
    items = []

    if isinstance(cover, dict):
        items.append(cover)

    items.extend(gallery)

    for i, item in enumerate(items):
        url = item.get("url")
        mime = item.get("mime", "")
        media_type = "video" if "video" in mime else "image"

        if url:
            media.append({
                "place_id": place_id,
                "type": media_type,
                "mime": mime,
                "url": url,
                "position": i,
            })

    return media