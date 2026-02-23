import json
import re
from typing import Any, Optional

def extract_json_block(text: str) -> Optional[str]:
    """
    Try to find the first JSON object in model output.
    Robust enough for LLM outputs that include extra text.
    """
    # common: ```json ... ```
    fenced = re.search(r"```json\s*(\{.*?\})\s*```", text, re.DOTALL)
    if fenced:
        return fenced.group(1)

    # fallback: first {...} block
    brace = re.search(r"(\{.*\})", text, re.DOTALL)
    if brace:
        return brace.group(1)

    return None

def loads_json(text: str) -> Any:
    return json.loads(text)
