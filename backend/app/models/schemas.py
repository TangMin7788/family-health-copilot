"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum


class VisibilityLevel(str, Enum):
    """Report visibility levels"""
    PRIVATE = "PRIVATE"
    SHARED_SUMMARY = "SHARED_SUMMARY"
    CAREGIVER = "CAREGIVER"


class UrgencyLevel(str, Enum):
    """Urgency levels"""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    EMERGENCY = "EMERGENCY"
    UNKNOWN = "UNKNOWN"


class ReportCreate(BaseModel):
    """Schema for creating a new report"""
    owner: str = Field(..., description="Report owner (alice, bob, etc.)")
    visibility: VisibilityLevel = Field(default=VisibilityLevel.SHARED_SUMMARY)
    report_text: str = Field(..., min_length=10, description="Raw report text")


class ReportResponse(BaseModel):
    """Schema for report response"""
    id: int
    owner: str
    visibility: str
    urgency: str
    status: str
    created_at: str
    report_text: Optional[str] = None
    extracted: Optional[Dict[str, Any]] = None
    patient_view: Optional[str] = None
    family_view: Optional[str] = None

    class Config:
        from_attributes = True


class ExtractRequest(BaseModel):
    """Schema for extraction request"""
    report_text: str = Field(..., min_length=10)


class ExtractResponse(BaseModel):
    """Schema for extraction response"""
    extracted: Optional[Dict[str, Any]] = None
    raw_output: Optional[str] = None
    processing_time_ms: Optional[float] = None


class TriageRequest(BaseModel):
    """Schema for triage request"""
    extracted: Dict[str, Any]


class TriageResponse(BaseModel):
    """Schema for triage response"""
    urgency: str
    rationale: str


class GenerateExplanationRequest(BaseModel):
    """Schema for generating explanation"""
    extracted: Dict[str, Any]
    triage: Dict[str, str]


class GenerateExplanationResponse(BaseModel):
    """Schema for explanation response"""
    explanation: str


class ImageAnalysisRequest(BaseModel):
    """Schema for image analysis request"""
    prompt: str = Field(
        default="Describe this medical image in detail",
        description="Text prompt for image analysis"
    )
    max_new_tokens: int = Field(
        default=2000,
        ge=100,
        le=4000,
        description="Maximum tokens in the response"
    )


class ImageAnalysisResponse(BaseModel):
    """Schema for image analysis response"""
    analysis: str = Field(..., description="Image analysis result")
    processing_time_ms: float = Field(..., description="Processing time in milliseconds")
