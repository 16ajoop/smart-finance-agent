from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database.database import get_db
from app.models.financial_profile import FinancialProfile
from app.auth import get_current_user


router = APIRouter(
    prefix="/financial-profile",
    tags=["Financial Profile"]
)


class FinancialProfileCreate(BaseModel):
    monthly_income: float
    emergency_fund_target: float = 0
    travel_budget: float = 0
    food_budget: float = 0
    accommodation_budget: float = 0
    electricity_budget: float = 0
    transport_budget: float = 0
    sip_amount: float = 0
    insurance_amount: float = 0
    recharge_amount: float = 0


@router.post("/")
def create_financial_profile(
    profile_data: FinancialProfileCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    user_id = current_user["sub"]

    profile = (
        db.query(FinancialProfile)
        .filter(
            FinancialProfile.clerk_user_id == user_id
        )
        .first()
    )

    if profile:
        profile.monthly_income = profile_data.monthly_income
        profile.emergency_fund_target = profile_data.emergency_fund_target
        profile.travel_budget = profile_data.travel_budget
        profile.food_budget = profile_data.food_budget
        profile.accommodation_budget = profile_data.accommodation_budget
        profile.electricity_budget = profile_data.electricity_budget
        profile.transport_budget = profile_data.transport_budget
        profile.sip_amount = profile_data.sip_amount
        profile.insurance_amount = profile_data.insurance_amount
        profile.recharge_amount = profile_data.recharge_amount

        db.commit()
        db.refresh(profile)

        return {
            "message": "Financial profile updated successfully",
            "profile_id": profile.id
        }

    profile = FinancialProfile(
        clerk_user_id=user_id,
        monthly_income=profile_data.monthly_income,
        emergency_fund_target=profile_data.emergency_fund_target,
        travel_budget=profile_data.travel_budget,
        food_budget=profile_data.food_budget,
        accommodation_budget=profile_data.accommodation_budget,
        electricity_budget=profile_data.electricity_budget,
        transport_budget=profile_data.transport_budget,
        sip_amount=profile_data.sip_amount,
        insurance_amount=profile_data.insurance_amount,
        recharge_amount=profile_data.recharge_amount
    )

    db.add(profile)
    db.commit()
    db.refresh(profile)

    return {
        "message": "Financial profile created successfully",
        "profile_id": profile.id
    }


@router.get("/")
def get_financial_profile(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    user_id = current_user["sub"]

    profile = (
        db.query(FinancialProfile)
        .filter(
            FinancialProfile.clerk_user_id == user_id
        )
        .first()
    )

    if not profile:
        return {
            "message": "Financial profile not found"
        }

    return profile