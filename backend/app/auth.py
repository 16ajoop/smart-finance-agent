import os

import httpx
from dotenv import load_dotenv
from fastapi import HTTPException, Request

from clerk_backend_api import Clerk
from clerk_backend_api.jwks_helpers import AuthenticateRequestOptions


load_dotenv()

CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")

if not CLERK_SECRET_KEY:
    raise ValueError("CLERK_SECRET_KEY is not set in .env")


clerk = Clerk(
    bearer_auth=CLERK_SECRET_KEY
)


def get_current_user(request: Request):
    try:

        print("Authorization header:", request.headers.get("authorization"))
        # Convert FastAPI request into an httpx request
        httpx_request = httpx.Request(
            method=request.method,
            url=str(request.url),
            headers=dict(request.headers),
        )

        request_state = clerk.authenticate_request(
            httpx_request,
            AuthenticateRequestOptions(
                authorized_parties=[
                    "http://localhost:5173"
                ]
            )
        )

        print("Clerk signed in:", request_state.is_signed_in)
        print("Clerk auth reason:", request_state.reason)

        if not request_state.is_signed_in:
            raise HTTPException(
                status_code=401,
                detail=f"Clerk authentication failed: {request_state.reason}"
            )

        return request_state.payload

    except HTTPException:
        raise

    except Exception as error:
        print("Clerk authentication exception:", error)

        raise HTTPException(
            status_code=401,
            detail="Authentication verification failed"
        )