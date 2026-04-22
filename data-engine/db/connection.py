import mysql.connector

def get_connection():
    return mysql.connector.connect(
        host="localhost",
        user="dev",
        password="dev",
        database="red_city",
    )