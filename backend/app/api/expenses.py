from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from datetime import datetime, timezone

from app.database.database import get_db
from app.models.expense import Expense
from app.auth import get_current_user
from app.services.groq_service import extract_expense_from_text


router = APIRouter(
    prefix="/expenses",
    tags=["Expenses"]
)


class ExpenseCreate(BaseModel):
    amount: float
    category: str
    description: str | None = None
    payment_method: str | None = None
    expense_date: datetime | None = None
    source: str = "manual"

class ExpenseParseRequest(BaseModel):
    text: str


@router.post("/parse")
def parse_expense(
    expense_data: ExpenseParseRequest,
    current_user=Depends(get_current_user)
):
    current_date = datetime.now(
        timezone.utc
    ).date().isoformat()

    extracted_expense = extract_expense_from_text(
        expense_data.text,
        current_date
    )

    return extracted_expense.model_dump()


@router.post("/")
def create_expense(
    expense_data: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    user_id = current_user["sub"]

    expense = Expense(
        clerk_user_id=user_id,
        amount=expense_data.amount,
        category=expense_data.category,
        description=expense_data.description,
        payment_method=expense_data.payment_method,
        expense_date=(
                expense_data.expense_date
                or datetime.now(timezone.utc).replace(tzinfo=None)
        ),
        source=expense_data.source
    )

    db.add(expense)
    db.commit()
    db.refresh(expense)

    return {
        "message": "Expense added successfully",
        "expense_id": expense.id
    }


@router.get("/")
def get_expenses(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    user_id = current_user["sub"]

    expenses = (
        db.query(Expense)
        .filter(Expense.clerk_user_id == user_id)
        .all()
    )

    return expenses