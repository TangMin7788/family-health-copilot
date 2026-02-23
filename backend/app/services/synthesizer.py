from typing import Any, Dict
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

class MedGemmaSynthesizer:
    def __init__(self, model_id_or_path: str):
        self.tokenizer = AutoTokenizer.from_pretrained(model_id_or_path, use_fast=True)
        # Use AutoModelForCausalLM (Gemma3 is supported)
        self.model = AutoModelForCausalLM.from_pretrained(
            model_id_or_path,
            torch_dtype=torch.bfloat16 if torch.cuda.is_available() else torch.float32,
            device_map={"": "cuda:1"}  # Use GPU 1 to avoid conflicts
        )

    def _gen(self, prompt: str, max_new_tokens: int = 500) -> str:
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
                max_new_tokens=max_new_tokens,
                do_sample=True,
                temperature=0.3,
                top_p=0.9,
            )
        return self.tokenizer.decode(out[0], skip_special_tokens=True)

    def patient_view(self, extracted: Dict[str, Any], triage: Dict[str, str]) -> str:
        # Map urgency to icons for visual clarity
        urgency_map = {
            "ROUTINE": "💚 ROUTINE - No immediate action needed",
            "URGENT": "💛 URGENT - Schedule appointment soon",
            "EMERGENT": "❤️‍🔥 EMERGENCY - Seek immediate care"
        }
        urgency = triage.get("urgency", "ROUTINE")
        urgency_display = urgency_map.get(urgency, f"⚪ {urgency}")

        prompt = f"""
You are a helpful medical communication assistant.
This is NOT diagnosis or treatment.

Given extracted radiology findings JSON and urgency, write a patient-friendly explanation in simple language using this EXACT format:

---
# 🩺 Your Test Results - Explained

## 📊 What Was Found
[Brief description in simple, non-scary language]

## 💭 What This Means
[General explanation - no definitive diagnosis]

## ⏰ Next Steps
**Urgency:** {urgency_display}

- [Action item 1 - e.g., follow-up appointment timing]
- [Action item 2 - e.g., continue current treatment]

## 🚨 When to Call the Doctor
[Red flags / warning signs to watch for]

## ❓ Questions to Ask Your Doctor
1. [Question 1]
2. [Question 2]
3. [Question 3]
4. [Question 4]
5. [Question 5]

---

*⚠️ This is for information only. Always consult your doctor.*

Extracted JSON:
{extracted}
""".strip()
        return self._gen(prompt)

    def family_view(self, extracted: Dict[str, Any], triage: Dict[str, str]) -> str:
        # Map urgency to icons for visual clarity
        urgency_map = {
            "ROUTINE": "💚 ROUTINE - No immediate action needed",
            "URGENT": "💛 URGENT - Schedule appointment soon",
            "EMERGENT": "❤️‍🔥 EMERGENCY - Seek immediate care"
        }
        urgency = triage.get("urgency", "ROUTINE")
        rationale = triage.get("rationale", "Standard assessment completed")
        urgency_display = urgency_map.get(urgency, f"⚪ {urgency}")

        prompt = f"""
You are a family-care coordination assistant.
This is NOT diagnosis or treatment.

Write a caregiver-oriented summary with CLEAR VISUAL SECTIONS using this EXACT format:

---
# 💝 Family Care Summary

## 📊 Urgency Level
**{urgency_display}**

*Why:* {rationale}

## 🔍 Key Findings
- ✅ [Most important finding - what was found]
- ✅ [Second important - stability/change]
- ❌ [What was ruled out - good news!]
- ✅ [Any other relevant info]

## 📅 Action Items
- [ ] Schedule: [what appointment/follow-up]
- [ ] Bring: [prior reports, medication list]
- [ ] Prepare: [questions to ask doctor]

## 💡 How to Help
- **Practical support:** [transport, meals]
- **Emotional support:** [be encouraging]
- **Monitoring:** [what symptoms to watch]

---

*⚠️ This is information only, NOT medical advice. Always consult healthcare professionals for decisions.*

Extracted JSON:
{extracted}
""".strip()
        return self._gen(prompt)
