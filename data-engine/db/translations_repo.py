from db.connection import get_connection
from utils.logger import logger

def insert_translation(translation):
    db = get_connection()
    cursor = db.cursor()

    try:
        sql = """
        INSERT INTO translations
        (place_id, language, summary, description)
        VALUES (%s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
            summary = VALUES(summary),
            description = VALUES(description)
        """

        values = ( translation["place_id"], translation["language"], translation["summary"], translation["description"] )

        cursor.execute(sql, values)
        db.commit()

    except Exception as e:
        db.rollback()
        logger.error(f"Insert/Update failed: {e}")
        raise

    finally:
        cursor.close()
        db.close()

def set_translated(place_id):
    db = get_connection()
    cursor = db.cursor()

    try:
        cursor.execute("UPDATE places SET translated = 1 WHERE id = %s", (place_id,))
        db.commit()

    except Exception as e:
        db.rollback()
        logger.error(f"Setting translated status failed: {e}")

    finally:
        cursor.close()
        db.close()
