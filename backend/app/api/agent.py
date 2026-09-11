from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.auth import get_current_user
from app.services.agent_service import ask_financial_agent


router = APIRouter(
    prefix="/agent",
    tags=["AI Agent"]
)


class AgentRequest(BaseModel):
    question: str


@router.post("/ask")
def ask_agent(
    request: AgentRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    user_id = current_user["sub"]

    answer = ask_financial_agent(
        request.question,
        db,
        user_id
    )

    return {
        "question": request.question,
        "answer": answer
    }