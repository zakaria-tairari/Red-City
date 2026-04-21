from db.connection import get_connection

def insert_categories(categories):
    db = get_connection()
    cursor = db.cursor()

    sql = """
    INSERT INTO categories (name, code)
    VALUES (%s, %s)
    ON DUPLICATE KEY UPDATE name = VALUES(name)
    """

    values = [(category["name"], category["code"]) for category in categories]

    cursor.executemany(sql, values)
    print(f"Categories inserted/updated with success: {cursor.rowcount} rows affected")

    db.commit()
    cursor.close()
    db.close()