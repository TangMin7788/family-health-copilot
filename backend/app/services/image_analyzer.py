"""
Image Analyzer Service - MedGemma Image Analysis
Handles medical image analysis using transformers pipeline
"""
import torch
from transformers import pipeline
from PIL import Image
from io import BytesIO
import base64
from typing import Union


class MedGemmaImageAnalyzer:
    """
    Medical image analyzer using MedGemma model
    Supports image upload and analysis with text prompts
    """

    def __init__(self, model_id_or_path: str):
        """
        Initialize the image analyzer

        Args:
            model_id_or_path: Path to the MedGemma model
        """
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model_path = model_id_or_path
        self._pipe = None
        self._load_pipeline()

    def _load_pipeline(self):
        """Load the image-to-text pipeline"""
        try:
            self._pipe = pipeline(
                "image-text-to-text",
                model=self.model_path,
                torch_dtype=torch.bfloat16 if self.device == "cuda" else torch.float32,
                device=self.device,
            )
            print(f"  ✅ Image analyzer loaded on {self.device}")
        except Exception as e:
            print(f"  ❌ Failed to load image analyzer: {e}")
            raise

    def analyze(
        self,
        image: Image.Image,
        prompt: str = "Describe this medical image in detail",
        max_new_tokens: int = 2000
    ) -> str:
        """
        Analyze a medical image with a text prompt

        Args:
            image: PIL Image object
            prompt: Text prompt for analysis
            max_new_tokens: Maximum tokens in response

        Returns:
            Analysis result text
        """
        if not self._pipe:
            raise RuntimeError("Image analyzer not loaded")

        # Prepare messages in the format expected by MedGemma
        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "image", "image": image},
                    {"type": "text", "text": prompt}
                ]
            }
        ]

        # Run inference
        try:
            output = self._pipe(text=messages, max_new_tokens=max_new_tokens)
            result = output[0]["generated_text"][-1]["content"]
            return result
        except Exception as e:
            raise RuntimeError(f"Image analysis failed: {str(e)}")

    def is_loaded(self) -> bool:
        """Check if pipeline is loaded"""
        return self._pipe is not None
