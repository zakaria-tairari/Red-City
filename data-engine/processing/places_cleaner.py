import pandas as pd

def clean_places(places, category_id):
    df = pd.DataFrame(places)

    df = df.drop_duplicates(subset=["documentId"])

    df["category_id"] = category_id

    df = df.rename(columns={
        "documentId": "document_id",
        "place": "name",
        "gpsLat": "lat",
        "gpsLon": "lon",
        "phone1": "phone",
    })

    df["lat"] = pd.to_numeric(df["lat"], errors="coerce").round(6)
    df["lon"] = pd.to_numeric(df["lon"], errors="coerce").round(6)

    df = df.dropna(subset=["name", "lat", "lon"])

    text_cols = [
        "name", "email", "phone", "website",
        "area", "address", "summary", "description"
    ]

    for col in text_cols:
        if col in df.columns:
            df[col] = df[col].astype("string").str.strip()

    if "email" in df.columns:
        df["email"] = df["email"].str.lower()

    if "website" in df.columns:
        df["website"] = df["website"].str.lower()

    if "area" in df.columns:
        df["area"] = df["area"].str.title()

    if "summary" in df.columns:
        df["summary"] = df["summary"].str.replace("\\n", "\n")

    if "description" in df.columns:
        df["description"] = df["description"].str.replace("\\n", "\n")

    df = df[[
        "document_id",
        "category_id",
        "name",
        "email",
        "phone",
        "website",
        "area",
        "address",
        "lat",
        "lon",
        "summary",
        "description"
    ]]

    return df