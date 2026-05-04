from db.connection import get_connection
from ai.prompts import TAXONOMY
from utils.logger import logger

def seed_tags():
    db = get_connection()
    cursor = db.cursor()

    try:
        for category_id, tags in TAXONOMY.items():

            for tag in tags:
                cursor.execute("""
                    INSERT IGNORE INTO tags (name, category_id, created_at, updated_at)
                    VALUES (%s, %s, NOW(), NOW())
                """, (tag, category_id if isinstance(category_id, int) else None))

        db.commit()
        logger.info("Tags seeded successfully")

    except Exception as e:
        db.rollback()
        logger.error(f"Tags seeding failed: {e}")

    finally:
        cursor.close()
        db.close()