from db.connection import get_connection
import pandas as pd
from utils.logger import logger

def insert_categories(categories):
    db = get_connection()
    cursor = db.cursor()
    df = pd.DataFrame(categories)

    COLUMNS = ["name", "code"]

    try:
        df = df.reindex(columns=COLUMNS)

        sql = """
        INSERT INTO categories (name, code)
        VALUES (%s, %s)
        ON DUPLICATE KEY UPDATE name = VALUES(name)
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

def get_categories():
    db = get_connection()
    cursor = db.cursor(dictionary=True)

    try:
        sql = "SELECT * FROM categories"
        cursor.execute(sql)

        result = cursor.fetchall()
        return result

    except Exception as e:
        logger.error(f"DB fetching failed: {e}")
        return []

    finally:
        cursor.close()
        db.close()