from openai import OpenAI
from config import OPENROUTER_API_KEY
from itertools import batched
from ai.prompts import build_tags_prompt
from db.categories_repo import get_categories
from db.places_repo import get_places_by_category, get_tag_id, insert_place_tag
import json
from utils.logger import logger

def generate_tags():
  client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY,
  )

  categories = get_categories()

  for category in categories:
    places = get_places_by_category(category["id"], only_untagged=True)


    for batch in batched(places, 20):
      prompt = build_tags_prompt(batch, category["id"])

      try:
          response = client.chat.completions.create(
            model="openai/gpt-oss-120b:free",
            messages=[
                    {
                      "role": "user",
                      "content": prompt,
                    }
                  ],
            extra_body={"reasoning": {"enabled": True}}
          )

          response = response.choices[0].message
          print(response.content)

          data = json.loads(response.content)

          for item in data:
              place_id = item["id"]
              tags = item["tags"]

              for tag in tags:
                  tag_id = get_tag_id(tag["tag"])
                  insert_place_tag(place_id, tag_id, tag["score"])

          logger.info(f"Batch inserted for category {category['code']}")

      except Exception as e:
          logger.error(f"Error fetching AI response: {e}")