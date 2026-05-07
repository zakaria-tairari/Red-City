from db.connection import get_connection
import pandas as pd
from utils.logger import logger

def insert_translations(translations):
    db = get_connection()
    cursor = db.cursor()
    df = pd.DataFrame(translations)

    COLUMNS = ["place_id", "language", "summary", "description"]

    try:
        df = df.reindex(columns=COLUMNS)

        sql = """
        INSERT IGNORE INTO translations
        (place_id, language, summary, description)
        VALUES (%s, %s, %s, %s)
        """

        df = df.where(pd.notnull(df), None)
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
