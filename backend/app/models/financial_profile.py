from sqlalchemy import Column, Integer, Float, String

from app.database.database import Base


class FinancialProfile(Base):
    __tablename__ = "financial_profiles"

    id = Column(Integer, primary_key=True, index=True)

    clerk_user_id = Column(
        String,
        nullable=False,
        index=True
    )

    monthly_income = Column(
        Float,
        nullable=False
    )

    emergency_fund_target = Column(
        Float,
        default=0
    )

    travel_budget = Column(
        Float,
        default=0
    )

    food_budget = Column(
        Float,
        default=0
    )

    accommodation_budget = Column(
        Float,
        default=0
    )

    electricity_budget = Column(
        Float,
        default=0
    )

    transport_budget = Column(
        Float,
        default=0
    )

    sip_amount = Column(
        Float,
        default=0
    )

    insurance_amount = Column(
        Float,
        default=0
    )

    recharge_amount = Column(
        Float,
        default=0
    )