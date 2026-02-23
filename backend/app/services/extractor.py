import json
from typing import Any, Dict, Optional, Tuple

import torch
from jsonschema import validate, ValidationError
from transformers import AutoTokenizer, AutoModelForCausalLM

from utils.json_utils import extract_json_block, loads_json

class MedGemmaExtractor:
    def __init__(self, model_id_or_path: str, schema: Dict[str, Any]):
        self.schema = schema
        self.tokenizer = AutoTokenizer.from_pretrained(model_id_or_path, use_fast=True)
        # Use AutoModelForCausalLM (Gemma3 is supported)
        device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model = AutoModelForCausalLM.from_pretrained(
            model_id_or_path,
            torch_dtype=torch.bfloat16 if torch.cuda.is_available() else torch.float32,
        ).to(device)

    def _prompt(self, report_text: str) -> str:
        # Strict extraction prompt (no diagnosis, evidence required)
        return f"""
You are a radiology report information extraction system.

Rules:
- Output MUST be a single valid JSON object and nothing else.
- Do NOT add findings that are not explicitly supported by the report.
- Every entity and critical flag MUST include an "evidence" field that is an exact contiguous substring from the report.
- Handle negation:
  - "no evidence of X" => certainty=absent
  - "cannot exclude X" => certainty=uncertain
- This is NOT medical diagnosis or treatment.

Return JSON with keys:
study(modality, body_part, indication),
sections(findings, impression),
entities(list of entity/anatomy/certainty/severity/temporal/evidence),
critical_flags(list of flag/status/evidence),
quality_checks(json_valid, missing_sections, notes).

Radiology report:
<<<
{report_text}
>>>
""".strip()

    def _generate(self, prompt: str) -> str:
        # Apply chat template for Gemma3
        messages = [{"role": "user", "content": prompt}]
        formatted_prompt = self.tokenizer.apply_chat_template(
            messages, tokenize=False, add_generation_prompt=True
        )
        inputs = self.tokenizer(formatted_prompt, return_tensors="pt")
        inputs = {k: v.to(self.model.device) for k, v in inputs.items()}

        with torch.no_grad():
            out = self.model.generate(
                **inputs,
                max_new_tokens=900,
                do_sample=True,
                temperature=0.2,
                top_p=0.9,
            )
        return self.tokenizer.decode(out[0], skip_special_tokens=True)

    def _validate_and_fix_evidence(self, extracted: Dict[str, Any], report_text: str) -> Dict[str, Any]:
        # evidence must appear in report_text; otherwise mark uncertain / remove evidence
        def in_report(ev: str) -> bool:
            return bool(ev) and (ev in report_text)

        for e in extracted.get("entities", []):
            ev = e.get("evidence", "")
            if not in_report(ev):
                # keep safe: downgrade certainty if evidence missing
                e["certainty"] = "uncertain"
                e["evidence"] = ""

        for f in extracted.get("critical_flags", []):
            ev = f.get("evidence", "")
            if not in_report(ev):
                f["status"] = "uncertain"
                f["evidence"] = ""

        return extracted

    def extract(self, report_text: str) -> Tuple[Optional[Dict[str, Any]], str]:
        """
        Returns: (json_or_none, raw_model_text)
        Includes one retry if schema validation fails.
        """
        prompt = self._prompt(report_text)

        for attempt in (1, 2):
            raw = self._generate(prompt)
            block = extract_json_block(raw)
            if not block:
                continue

            try:
                data = loads_json(block)
                # validate schema
                validate(instance=data, schema=self.schema)
                data = self._validate_and_fix_evidence(data, report_text)
                # update quality_checks
                qc = data.get("quality_checks", {})
                qc["json_valid"] = True
                qc.setdefault("missing_sections", [])
                qc.setdefault("notes", "")
                data["quality_checks"] = qc
                return data, raw
            except (json.JSONDecodeError, ValidationError):
                # retry once
                continue

        return None, raw
