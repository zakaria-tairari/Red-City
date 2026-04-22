import pandas as pd

def clean_categories(categories):
    df = pd.DataFrame(categories)

    df = df.rename(columns={
        "category": "name",
        "slug": "code"
    })

    df["name"] = df["name"].str.title().str.strip()
    df["code"] = df["code"].str.lower().str.strip()

    df = df.drop_duplicates(subset=["code"])

    return df[["name", "code"]]