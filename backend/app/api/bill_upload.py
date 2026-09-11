from fastapi import APIRouter, Depends, UploadFile, File, HTTPException

from app.auth import get_current_user
from app.services.bill_service import extract_expense_from_bill


router = APIRouter(
    prefix="/bills",
    tags=["Bills"]
)


@router.post("/parse")
async def parse_bill(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user)
):

    allowed_types = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ]

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Please upload a JPG, PNG, or WEBP receipt image."
        )

    image_bytes = await file.read()

    if not image_bytes:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty."
        )

    try:

        extracted_bill = extract_expense_from_bill(
            image_bytes,
            file.content_type
        )

        return extracted_bill

    except Exception as error:

        print(
            "Bill extraction error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to analyze the receipt."
        )