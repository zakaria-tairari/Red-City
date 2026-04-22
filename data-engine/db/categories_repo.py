from db.connection import get_connection
import pandas as pd

def insert_categories(categories):
    db = get_connection()
    cursor = db.cursor()
    df = pd.DataFrame(categories)
    COLUMNS = ["name", "code"]

    try:
        df = df.reindex(columns=COLUMNS)
        df = df.astype(object).where(pd.notnull(df), None)

        sql = """
        INSERT INTO categories (name, code)
        VALUES (%s, %s)
        ON DUPLICATE KEY UPDATE name = VALUES(name)
        """

        df = df.where(pd.notnull(df), None)
        values = df.to_records(index=False).tolist()

        cursor.executemany(sql, values)
        db.commit()

    except Exception as e:
        db.rollback()
        print(f"Error inserting categories: {e}")
    
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
        print(f"Error fetching categories: {e}")
        return []

    finally:
        cursor.close()
        db.close()