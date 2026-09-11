from sqlalchemy.orm import Session

from app.models.expense import Expense
from app.models.financial_profile import FinancialProfile


def get_financial_profile(
    db: Session,
    user_id: str
):
    profile = (
        db.query(FinancialProfile)
        .filter(
            FinancialProfile.clerk_user_id == user_id
        )
        .first()
    )

    if not profile:
        return {
            "found": False,
            "message": "Financial profile not found."
        }

    return {
        "found": True,
        "monthly_income": profile.monthly_income,
        "emergency_fund_target": profile.emergency_fund_target,
        "food_budget": profile.food_budget,
        "accommodation_budget": profile.accommodation_budget,
        "electricity_budget": profile.electricity_budget,
        "transport_budget": profile.transport_budget,
        "insurance_amount": profile.insurance_amount,
        "travel_budget": profile.travel_budget,
        "sip_amount": profile.sip_amount,
        "recharge_amount": profile.recharge_amount
    }


def get_expenses(
    db: Session,
    user_id: str
):
    expenses = (
        db.query(Expense)
        .filter(
            Expense.clerk_user_id == user_id
        )
        .all()
    )

    return [
        {
            "id": expense.id,
            "amount": expense.amount,
            "category": expense.category,
            "description": expense.description,
            "payment_method": expense.payment_method,
            "expense_date": (
                expense.expense_date.isoformat()
                if expense.expense_date
                else None
            ),
            "source": expense.source
        }
        for expense in expenses
    ]


def get_category_spending(
    db: Session,
    user_id: str,
    category: str
):
    expenses = (
        db.query(Expense)
        .filter(
            Expense.clerk_user_id == user_id,
            Expense.category.ilike(category)
        )
        .all()
    )

    total = sum(
        expense.amount
        for expense in expenses
    )

    return {
        "category": category,
        "total_spent": round(total, 2),
        "expense_count": len(expenses)
    }


def get_all_category_spending(
    db: Session,
    user_id: str
):
    expenses = (
        db.query(Expense)
        .filter(
            Expense.clerk_user_id == user_id
        )
        .all()
    )

    spending = {}

    for expense in expenses:
        category = expense.category

        spending[category] = (
            spending.get(category, 0)
            + expense.amount
        )

    return {
        category: round(amount, 2)
        for category, amount in spending.items()
    }


def calculate_financial_summary(
    db: Session,
    user_id: str
):
    profile = (
        db.query(FinancialProfile)
        .filter(
            FinancialProfile.clerk_user_id == user_id
        )
        .first()
    )

    expenses = (
        db.query(Expense)
        .filter(
            Expense.clerk_user_id == user_id
        )
        .all()
    )

    if not profile:
        return {
            "error": "Financial profile not found."
        }

    income = profile.monthly_income or 0

    total_expenses = sum(
        expense.amount
        for expense in expenses
    )

    balance = income - total_expenses

    savings_rate = (
        (balance / income) * 100
        if income > 0
        else 0
    )

    return {
        "monthly_income": round(income, 2),
        "total_recorded_expenses": round(
            total_expenses,
            2
        ),
        "remaining_balance": round(
            balance,
            2
        ),
        "savings_rate": round(
            savings_rate,
            2
        ),
        "sip_amount": profile.sip_amount or 0,
        "insurance_amount": profile.insurance_amount or 0,
        "emergency_fund_target": (
            profile.emergency_fund_target or 0
        )
    }


def calculate_disposable_income(
    db: Session,
    user_id: str
):
    profile = (
        db.query(FinancialProfile)
        .filter(
            FinancialProfile.clerk_user_id == user_id
        )
        .first()
    )

    expenses = (
        db.query(Expense)
        .filter(
            Expense.clerk_user_id == user_id
        )
        .all()
    )

    if not profile:
        return {
            "error": "Financial profile not found."
        }

    income = profile.monthly_income or 0

    recorded_expenses = sum(
        expense.amount
        for expense in expenses
    )

    sip = profile.sip_amount or 0
    insurance = profile.insurance_amount or 0

    disposable_income = (
        income
        - recorded_expenses
        - sip
        - insurance
    )

    return {
        "monthly_income": round(income, 2),
        "recorded_expenses": round(
            recorded_expenses,
            2
        ),
        "sip_commitment": round(
            sip,
            2
        ),
        "insurance_commitment": round(
            insurance,
            2
        ),
        "disposable_income": round(
            disposable_income,
            2
        )
    }


def calculate_budget_status(
    db: Session,
    user_id: str,
    category: str
):
    profile = (
        db.query(FinancialProfile)
        .filter(
            FinancialProfile.clerk_user_id == user_id
        )
        .first()
    )

    if not profile:
        return {
            "error": "Financial profile not found."
        }

    budget_map = {
        "Food": profile.food_budget,
        "Travel": profile.travel_budget,
        "Accommodation": profile.accommodation_budget,
        "Electricity": profile.electricity_budget,
        "Transport": profile.transport_budget,
        "Recharge": profile.recharge_amount,
        "Insurance": profile.insurance_amount
    }

    budget = budget_map.get(category)

    if budget is None:
        return {
            "category": category,
            "message": "No budget configured for this category."
        }

    spending = get_category_spending(
        db,
        user_id,
        category
    )

    spent = spending["total_spent"]

    remaining = budget - spent

    percentage = (
        (spent / budget) * 100
        if budget > 0
        else 0
    )

    return {
        "category": category,
        "budget": round(budget, 2),
        "spent": round(spent, 2),
        "remaining": round(remaining, 2),
        "percentage_used": round(
            percentage,
            2
        ),
        "over_budget": spent > budget
    }