from pipelines.run_categories import run_categories
from pipelines.run_places import run_places
from ai.tags_generator import generate_tags
from utils.logger import logger

def main():
    logger.info("Starting full ETL pipeline...")
    run_categories()
    run_places()
    logger.info("ETL finished successfully.")

    logger.info("Starting tags generation...")
    generate_tags()
    logger.info("Tags generation and insertion successful")

if __name__ == "__main__":
    main()