import mysql.connector
from config import DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE
from utils.logger import logger

def get_connection():
    try:
        return mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_DATABASE,
        )
    except Exception as e:
        logger.error(f"DB connection failed: {e}")