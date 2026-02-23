from typing import Dict, Any

EMERGENT_FLAGS = {
    "pneumothorax",
    "intracranial_hemorrhage",
    "free_air",
    "pulmonary_embolism"
}

def triage_risk(extracted: Dict[str, Any]) -> Dict[str, str]:
    """
    Explainable rule-based triage.
    Output: urgency + rationale (for demo and safety).
    """
    flags = extracted.get("critical_flags", [])
    for f in flags:
        flag = (f.get("flag") or "").lower()
        status = (f.get("status") or "").lower()
        if flag in EMERGENT_FLAGS and status in ("suspected", "uncertain"):
            return {
                "urgency": "EMERGENT",
                "rationale": f"Critical flag '{flag}' is {status}. Evidence: {f.get('evidence','')}"
            }

    # heuristic: many present entities → urgent
    present = [
        e for e in extracted.get("entities", [])
        if (e.get("certainty") == "present")
    ]
    if len(present) >= 2:
        return {
            "urgency": "URGENT",
            "rationale": f"{len(present)} abnormal findings present. Review recommended."
        }

    return {
        "urgency": "ROUTINE",
        "rationale": "No emergent critical flags detected by rule engine."
    }
