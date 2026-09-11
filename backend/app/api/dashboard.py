from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timezone

from app.database.database import get_db
from app.models.expense import Expense
from app.models.financial_profile import FinancialProfile
from app.auth import get_current_user


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/")
def get_dashboard(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user["sub"]

    # Get financial profile
    profile = (
        db.query(FinancialProfile)
        .filter(
            FinancialProfile.clerk_user_id == user_id
        )
        .first()
    )

    # Get all user expenses
    expenses = (
        db.query(Expense)
        .filter(
            Expense.clerk_user_id == user_id
        )
        .all()
    )

    # Monthly income
    monthly_income = (
        profile.monthly_income
        if profile
        else 0
    )

    # Total expenses
    total_expenses = sum(
        expense.amount
        for expense in expenses
    )

    # Remaining balance
    remaining_balance = (
        monthly_income - total_expenses
    )

    # Savings rate
    if monthly_income > 0:
        savings_rate = (
            remaining_balance / monthly_income
        ) * 100
    else:
        savings_rate = 0

    # Category-wise spending
    category_spending = {}

    for expense in expenses:
        category = expense.category

        category_spending[category] = (
            category_spending.get(category, 0)
            + expense.amount
        )

    # Budget mapping
    budgets = {}

    if profile:
        budgets = {
            "Food": profile.food_budget,
            "Travel": profile.travel_budget,
            "Accommodation": profile.accommodation_budget,
            "Electricity": profile.electricity_budget,
            "Transport": profile.transport_budget,
            "Recharge": profile.recharge_amount,
            "Insurance": profile.insurance_amount,
        }

    # Budget vs actual
    budget_status = []

    for category, budget in budgets.items():

        actual = category_spending.get(
            category,
            0
        )

        remaining = budget - actual

        budget_status.append({
            "category": category,
            "budget": budget,
            "spent": actual,
            "remaining": remaining,
            "percentage_used": (
                (actual / budget) * 100
                if budget > 0
                else 0
            )
        })

    # Recent expenses
    recent_expenses = sorted(
        expenses,
        key=lambda x: x.expense_date,
        reverse=True
    )[:10]

    recent_expense_data = [
        {
            "id": expense.id,
            "amount": expense.amount,
            "category": expense.category,
            "description": expense.description,
            "payment_method": expense.payment_method,
            "expense_date": expense.expense_date,
            "source": expense.source
        }
        for expense in recent_expenses
    ]

    return {
        "monthly_income": monthly_income,
        "total_expenses": total_expenses,
        "remaining_balance": remaining_balance,
        "savings_rate": round(
            savings_rate,
            2
        ),
        "category_spending": category_spending,
        "budget_status": budget_status,
        "recent_expenses": recent_expense_data
    }