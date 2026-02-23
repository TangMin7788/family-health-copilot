"""
Model inference API endpoints
"""
import time
from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import JSONResponse
from PIL import Image
from io import BytesIO
import base64
from app.models.schemas import (
    ExtractRequest,
    ExtractResponse,
    TriageRequest,
    TriageResponse,
    GenerateExplanationRequest,
    GenerateExplanationResponse,
    ImageAnalysisRequest,
    ImageAnalysisResponse
)
from app.services.model_service import ModelService

router = APIRouter()

# Get model service singleton
model_service = ModelService.get_instance()


@router.post("/extract", response_model=ExtractResponse)
async def extract_structured_data(request: ExtractRequest):
    """
    Extract structured information from medical report text

    Args:
        request: Extraction request with report text

    Returns:
        Extracted structured data
    """
    start_time = time.time()

    try:
        extracted, raw_output = model_service.extract(request.report_text)

        processing_time = (time.time() - start_time) * 1000  # Convert to ms

        return ExtractResponse(
            extracted=extracted,
            raw_output=raw_output,
            processing_time_ms=processing_time
        )

    except Exception as e:
        return ExtractResponse(
            extracted=None,
            raw_output=str(e),
            processing_time_ms=(time.time() - start_time) * 1000
        )


@router.post("/triage", response_model=TriageResponse)
async def assess_urgency(request: TriageRequest):
    """
    Assess urgency level from extracted data

    Args:
        request: Triage request with extracted data

    Returns:
        Urgency assessment
    """
    import sys
    from pathlib import Path

    # Import triage function
    sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))
    from backend.app.services.triage import triage_risk

    triage = triage_risk(request.extracted)

    return TriageResponse(
        urgency=triage["urgency"],
        rationale=triage["rationale"]
    )


@router.post("/patient-view", response_model=GenerateExplanationResponse)
async def generate_patient_view(request: GenerateExplanationRequest):
    """
    Generate patient-friendly explanation

    Args:
        request: Generation request with extracted data and triage

    Returns:
        Patient-friendly explanation
    """
    explanation = model_service.patient_view(
        request.extracted,
        request.triage
    )

    return GenerateExplanationResponse(explanation=explanation)


@router.post("/family-view", response_model=GenerateExplanationResponse)
async def generate_family_view(request: GenerateExplanationRequest):
    """
    Generate family-focused explanation

    Args:
        request: Generation request with extracted data and triage

    Returns:
        Family-focused explanation
    """
    explanation = model_service.family_view(
        request.extracted,
        request.triage
    )

    return GenerateExplanationResponse(explanation=explanation)


@router.get("/status")
async def get_model_status():
    """
    Get model loading status

    Returns:
        Model status information
    """
    return {
        "models_loaded": model_service.is_loaded(),
        "model_id": model_service.model_id,
        "status": "ready" if model_service.is_loaded() else "loading"
    }


@router.post("/analyze-image", response_model=ImageAnalysisResponse)
async def analyze_image(
    image: UploadFile = File(..., description="Medical image file (JPEG, PNG, etc.)"),
    prompt: str = Form(default="Describe this medical image in detail", description="Analysis prompt"),
    max_new_tokens: int = Form(default=2000, ge=100, le=4000, description="Maximum tokens in response")
):
    """
    Analyze a medical image using MedGemma

    Args:
        image: Uploaded image file
        prompt: Text prompt for analysis (optional)
        max_new_tokens: Maximum tokens in response (optional)

    Returns:
        Image analysis result
    """
    start_time = time.time()

    try:
        # Read and validate image file
        contents = await image.read()

        # Validate file size (max 10MB)
        if len(contents) > 10 * 1024 * 1024:
            return JSONResponse(
                status_code=413,
                content={"detail": "Image file too large. Maximum size is 10MB."}
            )

        # Open image with PIL
        try:
            pil_image = Image.open(BytesIO(contents))
            # Convert to RGB if necessary
            if pil_image.mode != "RGB":
                pil_image = pil_image.convert("RGB")
        except Exception as e:
            return JSONResponse(
                status_code=400,
                content={"detail": f"Invalid image file: {str(e)}"}
            )

        # Run image analysis
        analysis = model_service.analyze_image(pil_image, prompt)

        processing_time = (time.time() - start_time) * 1000  # Convert to ms

        return ImageAnalysisResponse(
            analysis=analysis,
            processing_time_ms=processing_time
        )

    except Exception as e:
        processing_time = (time.time() - start_time) * 1000
        return JSONResponse(
            status_code=500,
            content={
                "detail": f"Image analysis failed: {str(e)}",
                "processing_time_ms": processing_time
            }
        )
