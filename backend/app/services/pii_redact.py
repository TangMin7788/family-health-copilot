import re

PHONE = re.compile(r"\b(\+?\d[\d\s\-]{7,}\d)\b")
IDLIKE = re.compile(r"\b\d{15,18}\b")
EMAIL = re.compile(r"\b[\w\.-]+@[\w\.-]+\.\w+\b")

def redact_pii(text: str) -> str:
    # Minimal demo-grade redaction
    text = EMAIL.sub("[REDACTED_EMAIL]", text)
    text = PHONE.sub("[REDACTED_PHONE]", text)
    text = IDLIKE.sub("[REDACTED_ID]", text)
    return text
