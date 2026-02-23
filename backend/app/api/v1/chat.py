"""
Chat API endpoints for AI Doctor consultation
"""
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from pydantic import BaseModel
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

from app.services.model_service import ModelService

router = APIRouter()


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []


class ChatResponse(BaseModel):
    response: str
    timestamp: str


@router.post("/chat/consult", response_model=ChatResponse)
async def chat_consult(request: ChatRequest):
    """
    AI Doctor consultation endpoint

    Provides medical consultation based on user's symptoms or health questions.

    Args:
        request: Chat request with message and conversation history

    Returns:
        AI-generated medical consultation response
    """
    from datetime import datetime

    try:
        model_service = ModelService.get_instance()

        # Check if models are loaded
        if not model_service.is_loaded():
            raise HTTPException(
                status_code=503,
                detail="AI models are not loaded. Please try again later."
            )

        # Build conversation context
        system_prompt = """You are a Home Health Information Assistant (not a doctor).

Provide general health education and medication safety information only.

Rules:
- Do NOT diagnose.
- Do NOT prescribe.
- Do NOT give specific dose amounts.
- If information is insufficient, ask up to 3 short safety questions.
- If red flags appear, advise urgent medical care.

Red flags:
- Trouble breathing, chest pain, confusion, seizure
- Severe allergic reaction
- Black stool or vomiting blood
- Suspected overdose
- High fever >3 days
- Infant, pregnancy, serious liver/kidney disease

Medication guidance:
- Always read medication labels and warnings carefully.
- For medication questions, explain general safety principles.
- If asked about combining drugs, advise consulting a pharmacist or doctor.

Response format:
1) Summary (1–2 sentences)
2) Key points
3) When to seek care
4) Brief follow-up questions (if needed)

IMPORTANT: Always respond in English unless the user explicitly uses another language."""

        # Build conversation history
        conversation = [{"role": "system", "content": system_prompt}]

        # Add history
        for msg in request.history:
            conversation.append({
                "role": msg.role,
                "content": msg.content
            })

        # Add current message
        conversation.append({
            "role": "user",
            "content": request.message
        })

        # Generate response using the model
        response = model_service._generate_response(conversation)

        if not response:
            raise HTTPException(
                status_code=500,
                detail="Failed to generate AI response"
            )

        return ChatResponse(
            response=response,
            timestamp=datetime.utcnow().isoformat()
        )

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Error in chat consultation: {e}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Error processing consultation: {str(e)}"
        )


@router.get("/chat/status")
async def chat_status():
    """
    Check the status of the chat consultation service

    Returns:
        Status of the AI chat service
    """
    model_service = ModelService.get_instance()

    return {
        "service": "ai-doctor-chat",
        "status": "available" if model_service.is_loaded() else "unavailable",
        "models_loaded": model_service.is_loaded(),
        "endpoint": "/api/v1/chat/consult"
    }
