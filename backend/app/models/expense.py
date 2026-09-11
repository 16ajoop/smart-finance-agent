from sqlalchemy import Column, Integer, Float, String, DateTime
from datetime import datetime, timezone

from app.database.database import Base


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)

    clerk_user_id = Column(String, nullable=False, index=True)

    amount = Column(Float, nullable=False)

    category = Column(String, nullable=False)

    description = Column(String, nullable=True)

    expense_date = Column(
        DateTime, 
        default=lambda: datetime.now(timezone.utc).replace(tzinfo=None)
        )

    payment_method = Column(String, nullable=True)

    source = Column(String, default="manual")