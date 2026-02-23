"""
Model Service - Singleton pattern for managing AI models
Pre-loads models on startup and serves requests
"""
import sys
import os
from pathlib import Path

# Add parent directory to path to import existing services
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from backend.app.services.extractor import MedGemmaExtractor
from backend.app.services.synthesizer import MedGemmaSynthesizer
from backend.app.services.image_analyzer import MedGemmaImageAnalyzer
import json


class ModelService:
    """
    Singleton service managing AI models.
    Models are loaded once at startup and reused for all requests.
    """

    _instance = None

    def __init__(self):
        if ModelService._instance is not None:
            raise Exception("Use ModelService.get_instance() to get the singleton instance")

        # Use absolute path to the model
        project_root = Path(__file__).parent.parent.parent.parent
        self.model_id = str(project_root / "medgemma-1.5-4b-it")
        self._extractor = None
        self._synthesizer = None
        self._image_analyzer = None
        self._schema = None

        # Load models immediately
        self._load_models()

    @classmethod
    def get_instance(cls):
        """Get the singleton instance"""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _load_models(self):
        """Load AI models (called during startup)"""
        print(f"  📦 Loading extractor: {self.model_id}")
        self._schema = self._load_schema()
        self._extractor = MedGemmaExtractor(self.model_id, self._schema)

        print(f"  📦 Loading synthesizer: {self.model_id}")
        self._synthesizer = MedGemmaSynthesizer(self.model_id)

        print(f"  📦 Loading image analyzer: {self.model_id}")
        self._image_analyzer = MedGemmaImageAnalyzer(self.model_id)

    def _load_schema(self):
        """Load the radiology schema"""
        # Go up from backend/app/services/ to project root, then into schemas/
        project_root = Path(__file__).parent.parent.parent.parent
        schema_path = project_root / "schemas" / "radiology_schema.json"

        if not schema_path.exists():
            raise FileNotFoundError(f"Schema file not found: {schema_path}")

        with open(schema_path, "r") as f:
            return json.load(f)

    def is_loaded(self) -> bool:
        """Check if models are loaded"""
        return (
            self._extractor is not None and
            self._synthesizer is not None and
            self._image_analyzer is not None
        )

    def extract(self, report_text: str):
        """
        Extract structured information from report text

        Args:
            report_text: The medical report text (already redacted)

        Returns:
            Tuple of (extracted_dict, raw_output)
        """
        if not self._extractor:
            raise RuntimeError("Extractor model not loaded")

        return self._extractor.extract(report_text)

    def patient_view(self, extracted: dict, triage: dict) -> str:
        """
        Generate patient-friendly explanation

        Args:
            extracted: Structured extracted data
            triage: Triage assessment with urgency and rationale

        Returns:
            Patient-friendly explanation text
        """
        if not self._synthesizer:
            raise RuntimeError("Synthesizer model not loaded")

        return self._synthesizer.patient_view(extracted, triage)

    def family_view(self, extracted: dict, triage: dict) -> str:
        """
        Generate family-focused explanation

        Args:
            extracted: Structured extracted data
            triage: Triage assessment with urgency and rationale

        Returns:
            Family-focused explanation text
        """
        if not self._synthesizer:
            raise RuntimeError("Synthesizer model not loaded")

        return self._synthesizer.family_view(extracted, triage)

    def analyze_image(self, image: "Image.Image", prompt: str = "Describe this medical image in detail") -> str:
        """
        Analyze a medical image

        Args:
            image: PIL Image object
            prompt: Text prompt for analysis

        Returns:
            Analysis result text
        """
        if not self._image_analyzer:
            raise RuntimeError("Image analyzer model not loaded")

        return self._image_analyzer.analyze(image, prompt)

    def get_image_analyzer(self):
        """Get the image analyzer instance"""
        return self._image_analyzer

    def _generate_response(self, conversation: list) -> str:
        """
        Generate a chat response for AI Doctor consultation

        Args:
            conversation: List of message dictionaries with 'role' and 'content'

        Returns:
            Generated response text
        """
        if not self._synthesizer:
            raise RuntimeError("Synthesizer model not loaded")

        try:
            # Build conversation prompt for Gemma3 chat template
            # Extract system prompt and user messages
            system_prompt = ""
            user_messages = []

            for msg in conversation:
                if msg["role"] == "system":
                    system_prompt = msg["content"]
                elif msg["role"] == "user":
                    user_messages.append(msg["content"])
                elif msg["role"] == "assistant":
                    user_messages.append(f"Assistant: {msg['content']}")

            # Combine system prompt with the latest user message
            if system_prompt:
                # Include system prompt as context
                latest_message = user_messages[-1] if user_messages else ""
                full_prompt = f"{system_prompt}\n\n{latest_message}"
            else:
                full_prompt = user_messages[-1] if user_messages else ""

            # Use the synthesizer's _gen method which handles tokenization properly
            response = self._synthesizer._gen(full_prompt, max_new_tokens=1024)

            # Clean up the response - remove the prompt part if present
            if full_prompt.strip() in response:
                response = response.replace(full_prompt.strip(), "").strip()

            # Remove any trailing markers
            for stop_phrase in ["Assistant:", "User:", "System:", "<end_of_turn>"]:
                if stop_phrase in response:
                    response = response.split(stop_phrase)[0].strip()

            return response if response else "I apologize, but I couldn't generate a response. Please try again."

        except Exception as e:
            print(f"Error generating response: {e}")
            import traceback
            traceback.print_exc()
            raise RuntimeError(f"Failed to generate response: {str(e)}")
