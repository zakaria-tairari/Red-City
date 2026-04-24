from db.connection import get_connection
import pandas as pd
from utils.logger import logger

def insert_media(media):
    db = get_connection()
    cursor = db.cursor()
    df = pd.DataFrame(media)

    COLUMNS = ["place_id", "type", "mime", "url", "position"]

    try:
        df = df.reindex(columns=COLUMNS)

        sql = """
            INSERT INTO media (
                place_id,
                type,
                mime,
                url,
                position
            )
            VALUES (%s, %s, %s, %s, %s)

            ON DUPLICATE KEY UPDATE
                type = VALUES(type),
                mime = VALUES(mime),
                position = VALUES(position)
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