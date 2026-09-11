from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from app.database.database import engine, Base
from app.models.financial_profile import FinancialProfile
from app.models.expense import Expense
from app.api.expenses import router as expense_router
from app.api.financial_profile import router as financial_profile_router
from app.auth import get_current_user

from app.api.bill_upload import router as bill_router
from app.api.dashboard import router as dashboard_router
from app.api.agent import router as agent_router


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Smart Finance Agent",
    description="AI-powered personal financial analytics platform",
    version="0.1.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(expense_router)
app.include_router(financial_profile_router)
app.include_router(bill_router)
app.include_router(dashboard_router)
app.include_router(agent_router)


@app.get("/")
def root():
    return {
        "message": "Smart Finance Agent API is running!"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


@app.get("/me")
def get_me(current_user=Depends(get_current_user)):
    return {
        "message": "Authentication successful",
        "user": current_user
    }