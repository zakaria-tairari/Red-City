from db.connection import get_connection
import pandas as pd
from utils.logger import logger

def insert_places(places):
    db = get_connection()
    cursor = db.cursor()
    df = pd.DataFrame(places)

    COLUMNS = [
        "document_id", "category_id", "name", "email", "phone",
        "website", "area", "address", "lat", "lon", "summary", "description"
    ]

    try:
        df = df.reindex(columns=COLUMNS)

        sql = """
        INSERT INTO places (
            document_id, category_id, name, email, phone, website,
            area, address, lat, lon, summary, description
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            email = VALUES(email),
            phone = VALUES(phone),
            website = VALUES(website),
            area = VALUES(area),
            address = VALUES(address),
            lat = VALUES(lat),
            lon = VALUES(lon),
            summary = VALUES(summary),
            description = VALUES(description)
        """

        values = df.to_records(index=False).tolist()

        cursor.executemany(sql, values)
        logger.info(f"Insert/Update successful: {cursor.rowcount} rows")
        db.commit()

    except Exception as e:
        db.rollback()
        logger.error(f"Insert/Update failed: {e}")

    finally:
        cursor.close()
        db.close()

def get_places():
    db = get_connection()
    cursor = db.cursor(dictionary=True)

    try:
        sql = "SELECT * FROM places"
        cursor.execute(sql)

        result = cursor.fetchall()
        return result

    except Exception as e:
        logger.error(f"DB fetching failed: {e}")
        return []

    finally:
        cursor.close()
        db.close()

def get_places_by_category(category_id, only_untagged=False):
    db = get_connection()
    cursor = db.cursor(dictionary=True)

    try:
        if only_untagged:
            sql = "SELECT * FROM places WHERE category_id = %s AND tags_generated = 0"
        else:
            sql = "SELECT * FROM places WHERE category_id = %s"

        cursor.execute(sql, (category_id,))

        result = cursor.fetchall()
        return result

    except Exception as e:
        logger.error(f"DB fetching failed: {e}")
        return []

    finally:
        cursor.close()
        db.close()


def get_places_mapping():
    db = get_connection()
    cursor = db.cursor(dictionary=True)

    try:
        cursor.execute("SELECT id, document_id FROM places")
        rows = cursor.fetchall()

        return {
            row["document_id"]: row["id"]
            for row in rows
        }

    except Exception as e:
        logger.error(f"Mapping failed: {e}")
        return {}

    finally:
        cursor.close()
        db.close()

def insert_place_tag(place_id, tag_id, tag_score):
    db = get_connection()
    cursor = db.cursor()

    try:
        cursor.execute(
            "INSERT IGNORE INTO place_tag (place_id, tag_id, score) VALUES (%s, %s, %s)",
            (place_id, tag_id, tag_score)
        )
        cursor.execute("UPDATE places SET tags_generated = 1 WHERE id = %s", (place_id,))

        db.commit()

    except Exception as e:
        logger.error(f"Insert/Update failed: {e}")

    finally:
        cursor.close()
        db.close()

def get_tag_id(tag_name):
    db = get_connection()
    cursor = db.cursor()

    try:
        cursor.execute("SELECT id FROM tags WHERE name = %s", (tag_name,))
        result = cursor.fetchone()
        return result[0] if result else None
    
    except Exception as e:
        logger.error(f"DB fetching failed: {e}")

    finally:
        cursor.close()
        db.close()