import json
import os



from dotenv import load_dotenv
from groq import Groq
from pydantic import BaseModel


load_dotenv()


# ==========================================
# Expense Extraction Schema
# ==========================================

class ExpenseExtraction(BaseModel):
    amount: float
    category: str
    description: str | None
    payment_method: str | None
    expense_date: str | None
    source: str


# ==========================================
# Groq Client
# ==========================================

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


# ==========================================
# Extract Expense From Text
# ==========================================

def extract_expense_from_text(
    text: str,
    current_date: str
):
    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",

        messages=[
            {
                "role": "system",
                "content": f"""
You are an expense extraction assistant.

Today's date is {current_date}.

Extract expense information from the user's sentence.

Allowed categories:

- Food
- Travel
- Transport
- Accommodation
- Electricity
- Recharge
- Shopping
- Entertainment
- Healthcare
- Education
- Other

Rules:

1. Extract the amount as a number.

2. Convert currency expressions such as:
   - Rs
   - ₹
   - rupees
   into a numeric amount.

3. Choose the most appropriate category.

4. Create a short description of the expense.

5. Extract the payment method if mentioned.

6. Resolve relative dates such as:
   - today
   - yesterday
   - tomorrow

   using today's date.

7. If a value is not mentioned, return null.

8. The expense_date must use this format:
   YYYY-MM-DD

9. The source must always be:
   "voice"

10. Never invent financial information.

Return only the structured JSON response.
""",
            },
            {
                "role": "user",
                "content": text,
            },
        ],

        response_format={
            "type": "json_schema",
            "json_schema": {
                "name": "expense_extraction",
                "strict": True,
                "schema": {
                    "type": "object",

                    "properties": {
                        "amount": {
                            "type": "number"
                        },

                        "category": {
                            "type": "string"
                        },

                        "description": {
                            "type": ["string", "null"]
                        },

                        "payment_method": {
                            "type": ["string", "null"]
                        },

                        "expense_date": {
                            "type": ["string", "null"]
                        },

                        "source": {
                            "type": "string"
                        }
                    },

                    "required": [
                        "amount",
                        "category",
                        "description",
                        "payment_method",
                        "expense_date",
                        "source"
                    ],

                    "additionalProperties": False
                }
            }
        }
    )

    result = json.loads(
        response.choices[0].message.content
    )

    return ExpenseExtraction.model_validate(result)