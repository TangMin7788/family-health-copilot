# Sample Family Health Database

## Overview

This is a sample family health database containing example data for a family of 5, used for demonstrating and testing the Family Health Copilot system.

## Family Members

| ID | Member | Description |
|----|--------|-------------|
| `grandpa` | Grandpa | 68 years old, has chest CT and bone density reports |
| `grandma` | Grandma | 65 years old, has blood test and blood pressure monitoring records |
| `father` | Father | 40 years old, has annual physical examination report |
| `mother` | Mother | 38 years old, has gynecological examination report |
| `child` | Child | 6 years old, has pediatric well-child visit report |

## Report Statistics

- **Total Reports**: 7 reports
- **Family Members**: 5 people
- **Urgency Distribution**:
  - 🔴 **High**: 1 report - Grandma's hypertension
  - 🧡 **Medium**: 1 report - Grandma's blood test
  - 💛 **Low**: 3 reports - Grandpa's bone density, Father and Mother's checkups
  - 💚 **Routine**: 2 reports - Grandpa's CT, Child's checkup

## Member Report Details

### 👴 Grandpa (grandpa) - 2 Reports
1. **Chest CT Scan** (2024-01-15)
   - Urgency: 💚 Routine
   - Result: Normal, no abnormalities found
   - Visibility: SHARED_SUMMARY

2. **Bone Density Test** (2024-01-20)
   - Urgency: 💛 Low
   - Result: Osteopenia (low bone mass)
   - Visibility: SHARED_SUMMARY

### 👵 Grandma (grandma) - 2 Reports
1. **Complete Blood Count** (2024-02-01)
   - Urgency: 🧡 Medium
   - Result: Within normal range
   - Visibility: SHARED_SUMMARY

2. **Blood Pressure Monitoring** (2024-01-01 ~ 2024-02-01)
   - Urgency: 🔴 **High**
   - Result: Stage 2 Hypertension (143/91 mmHg)
   - Visibility: SHARED_SUMMARY
   - **Requires immediate medical attention** ⚠️

### 👨 Father (father) - 1 Report
1. **Annual Physical Examination** (2024-01-20)
   - Urgency: 💛 Low
   - Result: Overall good, slightly elevated triglycerides
   - Visibility: PRIVATE

### 👩 Mother (mother) - 1 Report
1. **Pap Smear and Pelvic Exam** (2024-02-10)
   - Urgency: 💛 Low
   - Result: Normal, mild inflammation
   - Visibility: SHARED_SUMMARY

### 👧 Child (child) - 1 Report
1. **Pediatric Well-Child Visit** (2024-02-15)
   - Urgency: 💚 Routine
   - Result: Normal growth and development
   - Visibility: CAREGIVER

## Usage

### Create Sample Database

```bash
python create_sample_db.py
```

This will:
1. Delete old `backend/family_health.db` (if exists)
2. Create new database and insert sample data
3. Display creation statistics

### Query Sample Data

```python
# View all reports
from db import list_reports_for_user
reports = list_reports_for_user('alice')

# View specific report
from db import get_report
report = get_report(7)  # Get Grandma's hypertension report
```

### View in Frontend

1. Start backend service
2. Visit Dashboard page
3. Statistics will automatically display:
   - Total Reports: 7
   - Family Members: 5
   - AI Consultations: ~5 (70% of reports)
   - Images Analyzed: ~3 (40% of reports)

## Data Characteristics

### Realism
- All reports based on authentic medical examination formats
- Contains complete examination indicators and reference values
- Provides both patient-view and family-view explanations

### Diversity
- Covers different age groups (child, adult, elderly)
- Includes different examination types (CT, blood tests, physicals, etc.)
- Demonstrates different urgency levels (routine to emergency)

### Educational Value
- Shows typical family health management scenarios
- Demonstrates chronic disease management (hypertension, osteopenia)
- Illustrates importance of preventive healthcare

## Database Location

```
/mnt/hdd/data/family_health_copilot/backend/family_health.db
```

## Important Notes

⚠️ **This database is for demonstration and testing purposes only**
- All data is fictional
- Should not be used for actual medical decisions
- Personal information has been redacted

## Extend Data

To add more sample data:

1. Edit `create_sample_db.py`
2. Add new report to `sample_reports` list
3. Re-run the script

```python
{
    "owner": "grandpa",  # Choose family member
    "visibility": "SHARED_SUMMARY",  # Visibility level
    "urgency": "ROUTINE",  # Urgency level
    "report_text": "...",  # Report text
    "extracted": {...},  # Structured extracted data
    "patient_view": "...",  # Patient-view explanation
    "family_view": "..."  # Family-view explanation
}
```

---

**Created**: 2026-02-23
**Version**: 1.0.0
**Language**: English
