import json
import os

from dotenv import load_dotenv
from groq import Groq

from app.services.financial_tools import (
    get_financial_profile,
    get_expenses,
    get_category_spending,
    get_all_category_spending,
    calculate_financial_summary,
    calculate_disposable_income,
    calculate_budget_status
)


load_dotenv()


client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


def ask_financial_agent(
    question,
    db,
    user_id
):

    tools = [
        {
            "type": "function",
            "function": {
                "name": "get_financial_profile",
                "description": (
                    "Get the user's income, budgets, "
                    "SIP, insurance and emergency fund target."
                ),
                "parameters": {
                    "type": "object",
                    "properties": {},
                    "required": []
                }
            }
        },

        {
            "type": "function",
            "function": {
                "name": "get_expenses",
                "description": (
                    "Get the user's recorded expenses."
                ),
                "parameters": {
                    "type": "object",
                    "properties": {},
                    "required": []
                }
            }
        },

        {
            "type": "function",
            "function": {
                "name": "get_category_spending",
                "description": (
                    "Get total spending for a specific category."
                ),
                "parameters": {
                    "type": "object",
                    "properties": {
                        "category": {
                            "type": "string",
                            "description": (
                                "Expense category such as Food, "
                                "Travel or Transport."
                            )
                        }
                    },
                    "required": ["category"]
                }
            }
        },

        {
            "type": "function",
            "function": {
                "name": "get_all_category_spending",
                "description": (
                    "Get spending totals for every category."
                ),
                "parameters": {
                    "type": "object",
                    "properties": {},
                    "required": []
                }
            }
        },

        {
            "type": "function",
            "function": {
                "name": "calculate_financial_summary",
                "description": (
                    "Calculate income, recorded expenses, "
                    "remaining balance and savings rate."
                ),
                "parameters": {
                    "type": "object",
                    "properties": {},
                    "required": []
                }
            }
        },

        {
            "type": "function",
            "function": {
                "name": "calculate_disposable_income",
                "description": (
                    "Calculate disposable income after "
                    "recorded expenses, SIP and insurance."
                ),
                "parameters": {
                    "type": "object",
                    "properties": {},
                    "required": []
                }
            }
        },

        {
            "type": "function",
            "function": {
                "name": "calculate_budget_status",
                "description": (
                    "Calculate spending against a category budget."
                ),
                "parameters": {
                    "type": "object",
                    "properties": {
                        "category": {
                            "type": "string"
                        }
                    },
                    "required": ["category"]
                }
            }
        }
    ]


    messages = [
        {
            "role": "system",
            "content": """
You are Smart Finance Agent.

You analyze the user's actual financial data.

IMPORTANT:

- Never invent financial numbers.
- Use tools whenever financial information is required.
- Python tools are the source of numerical truth.
- Do not perform unreliable mental arithmetic when a tool can calculate it.
- Explain calculations clearly.
- Give practical financial guidance.
- Do not claim to be a professional financial advisor.
- Be concise and friendly.
- Use Indian Rupee formatting when appropriate.

You can call multiple tools when necessary.
"""
        },
        {
            "role": "user",
            "content": question
        }
    ]


    # Agent tool-calling loop

    for _ in range(5):

        response = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=messages,
            tools=tools,
            tool_choice="auto",
            max_tokens=700
        )

        message = response.choices[0].message

        messages.append(message)


        # No more tools needed

        if not message.tool_calls:
            return message.content


        # Execute requested tools

        for tool_call in message.tool_calls:

            function_name = (
                tool_call.function.name
            )

            arguments = json.loads(
                tool_call.function.arguments
            )


            if function_name == "get_financial_profile":

                result = get_financial_profile(
                    db,
                    user_id
                )


            elif function_name == "get_expenses":

                result = get_expenses(
                    db,
                    user_id
                )


            elif function_name == "get_category_spending":

                result = get_category_spending(
                    db,
                    user_id,
                    arguments["category"]
                )


            elif function_name == "get_all_category_spending":

                result = get_all_category_spending(
                    db,
                    user_id
                )


            elif function_name == "calculate_financial_summary":

                result = calculate_financial_summary(
                    db,
                    user_id
                )


            elif function_name == "calculate_disposable_income":

                result = calculate_disposable_income(
                    db,
                    user_id
                )


            elif function_name == "calculate_budget_status":

                result = calculate_budget_status(
                    db,
                    user_id,
                    arguments["category"]
                )


            else:

                result = {
                    "error": "Unknown tool."
                }


            messages.append(
                {
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": json.dumps(
                        result,
                        default=str
                    )
                }
            )


    return (
        "I could not complete the financial analysis. "
        "Please try asking the question again."
    )