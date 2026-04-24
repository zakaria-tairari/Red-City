from pipelines.run_categories import run_categories
from pipelines.run_places import run_places
from utils.logger import logger

def main():
    logger.info("Starting full ETL pipeline...")

    run_categories()

    run_places()

    logger.info("ETL finished successfully.")

if __name__ == "__main__":
    main()