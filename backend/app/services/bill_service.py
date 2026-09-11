import base64
import json
import os

from dotenv import load_dotenv
from openai import OpenAI


load_dotenv()


client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)


def extract_expense_from_bill(
    image_bytes: bytes,
    content_type: str
):
    image_base64 = base64.b64encode(
        image_bytes
    ).decode("utf-8")

    image_url = (
        f"data:{content_type};base64,{image_base64}"
    )

    response = client.chat.completions.create(
        model="qwen/qwen3.6-27b",
        max_tokens=300,

        messages=[
            {
                "role": "system",
                "content": """
You extract data from receipts.

Do NOT explain your reasoning.
Do NOT provide analysis.
Do NOT use <think>.
Do NOT use Markdown.
Return ONLY one JSON object.

Required JSON fields:

amount
category
description
payment_method
expense_date
merchant
source

Rules:
amount = final amount paid.
category = one of Food, Travel, Transport, Accommodation,
Electricity, Recharge, Shopping, Entertainment,
Healthcare, Education, Other.
expense_date = YYYY-MM-DD.
Unknown values = null.
source = "bill".
"""
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "Read this receipt and return the required JSON only."
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": image_url
                        }
                    }
                ]
            }
        ]
    )

    content = response.choices[0].message.content

    print("Groq bill response:")
    print(content)

    if not content:
        raise ValueError(
            "Groq returned an empty response."
        )

    content = content.strip()

    # Remove Markdown fences if the model adds them
    if content.startswith("```json"):
        content = content[7:]

    elif content.startswith("```"):
        content = content[3:]

    if content.endswith("```"):
        content = content[:-3]

    content = content.strip()

    # If the model still returns <think>...</think>,
    # keep only the JSON portion after the thinking.
    if "<think>" in content:
        if "</think>" in content:
            content = content.split("</think>", 1)[1].strip()
        else:
            raise ValueError(
                "Groq stopped while generating its reasoning."
            )

    try:
        result = json.loads(content)

    except json.JSONDecodeError as error:
        print("Invalid JSON returned by Groq:")
        print(content)
        print("JSON error:", error)

        raise ValueError(
            "Groq returned invalid JSON."
        )

    # Make sure amount is numeric
    if result.get("amount") is not None:
        result["amount"] = float(result["amount"])

    return result