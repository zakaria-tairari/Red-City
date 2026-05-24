def extract_media(place, place_id):
    cover = place.get("coverImage")
    gallery = place.get("gallery", []) or []

    items = []
    cover_url = None

    if isinstance(cover, dict) and cover.get("url"):
        cover_url = cover.get("url")
        items.append(cover)

    for item in gallery:
        if item.get("url") != cover_url:
            items.append(item)

    media = []
    for item in items:
        url = item.get("url")
        mime = item.get("mime", "")
        if not url or not mime or "/" not in mime:
            continue
        media_type, subtype = mime.split("/", 1)
        ext = "jpg" if subtype == "jpeg" else subtype
        media.append({
            "place_id": place_id,
            "type": media_type,
            "ext": ext,
            "mime": mime,
            "original_url": url,
        })

    return media