# Family Health Copilot - Project Description

## 🎯 What We Built

**Family Health Copilot** is an AI-powered medical report analysis system designed to help families understand and manage healthcare information together while maintaining strict privacy controls. It bridges the gap between complex medical terminology and family caregiving by providing intelligent, privacy-aware analysis of medical reports.

## 💡 The Problem We Solve

Medical reports are often filled with complex terminology that's difficult for patients and families to understand. Traditional healthcare systems focus on individual patients, leaving family caregivers—who often coordinate care for aging parents or sick relatives—struggling to:

- Understand medical jargon in radiology and lab reports
- Coordinate care among multiple family members
- Maintain privacy while sharing necessary health information
- Prepare questions for doctor visits
- Track treatment progress over time

## 🚀 Our Solution

Family Health Copilot is a **local-first, AI-powered system** that transforms medical reports into easy-to-understand explanations for both patients and family members. It features:

### 1. **Intelligent Medical Document Understanding**
- **Powered by MedGemma 1.5** (a specialized medical AI model)
- Extracts structured data from unstructured medical reports
- Identifies key findings, critical flags, and quality indicators
- Provides evidence-based extraction (every claim links back to source text)

### 2. **Dual-View Explanations**
- **Patient View**: Medical jargon translated into plain language
- **Family View**: Actionable summaries focused on care coordination
- **Question Generation**: Suggested questions to ask healthcare providers

### 3. **Privacy-First Architecture**
- **Three-level permission system**:
  - `PRIVATE` - Only the report owner can view
  - `SHARED_SUMMARY` - Family sees summaries (not raw reports)
  - `CAREGIVER` - Extended access for designated caregivers
- **Automatic PII Redaction**: Removes names, emails, phone numbers, IDs
- **Local Processing**: All AI processing happens locally—no cloud uploads of sensitive data

### 4. **Family Collaboration Dashboard**
- Shared family health dashboard
- Role-based access control
- Report history tracking
- Urgency-based triage (ROUTINE, MEDIUM, HIGH, EMERGENCY)

## 🏗️ Technical Architecture

### Frontend (Next.js 14)
- Modern React-based web application
- TypeScript for type safety
- Tailwind CSS for responsive design
- Real-time updates with React Query
- Elegant teal-cyan gradient UI designed for warmth and clarity

### Backend (FastAPI)
- RESTful API with auto-generated documentation (Swagger)
- Asynchronous processing for heavy AI tasks
- SQLAlchemy ORM with SQLite database
- Background task processing
- Model preloading for fast response times

### AI Processing (MedGemma)
- **Model**: MedGemma 1.5-4b-it (4B parameters)
- **Framework**: PyTorch + Transformers
- **JSON Schema Validation**: Ensures structured output quality
- **Multi-stage Pipeline**:
  1. PII redaction
  2. Structured extraction
  3. Risk triage
  4. Dual-view synthesis

## 🌟 Key Features

### ✅ Structured Medical Data Extraction
Converts unstructured radiology reports into validated JSON format with:
- Study metadata (modality, body part, indication)
- Findings and impressions
- Detected entities with evidence references
- Critical findings with urgency flags
- Quality assessment indicators

### ✅ Risk Assessment & Triage
Automatic urgency classification based on detected findings:
- 💚 ROUTINE - Follow-up care
- 💛 MEDIUM - Timely attention needed
- 🧡 HIGH - Prompt medical attention recommended
- ❤️‍🔥 EMERGENCY - Immediate care required

### ✅ Evidence-Based Transparency
Every AI-generated claim includes:
- `evidence` field linking to source text
- Traceable extraction from original report
- JSON schema validation with automatic retry on failure

### ✅ Non-Diagnostic Design
- Explicit disclaimers on all outputs
- Designed for information understanding, not diagnosis
- Encourages professional medical consultation
- Emergency contact information prominently displayed

## 📊 Use Cases

### 1. Remote Family Caregiving
Adult children can monitor aging parents' health reports remotely, understanding key findings without needing to be at appointments.

### 2. Medical Appointment Preparation
Patients and families arrive prepared with relevant questions based on their report analysis.

### 3. Treatment Progress Tracking
Compare reports over time to understand treatment effectiveness with clear language explanations.

### 4. Privacy-Preserving Information Sharing
Share appropriate health information with family members while protecting sensitive details through granular permissions.

## 🛡️ Privacy & Security Guarantees

- ✅ **Local-First**: All AI processing on-device, no cloud uploads
- ✅ **PII Redaction**: Automatic removal of personal identifiers
- ✅ **Granular Permissions**: Three-tier access control model
- ✅ **Evidence Tracking**: All AI claims traceable to source
- ✅ **Data Minimization**: Only share summaries, not full reports
- ✅ **Non-Diagnostic**: Clear boundaries on system capabilities

## 🎨 User Experience Design

The interface combines technology with warmth:
- **Teal-cyan gradient theme** for professional yet approachable feel
- **Animated heartbeat icon** representing care and vitality
- **Card-based layouts** for easy scanning
- **Progress indicators** during AI processing
- **Color-coded urgency badges** for quick prioritization
- **Mobile-responsive design** for access on any device

## 🔧 Technology Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- React Query (TanStack Query)
- Axios

**Backend:**
- FastAPI
- Pydantic (data validation)
- SQLAlchemy (ORM)
- Uvicorn (ASGI server)
- SQLite (database)

**AI/ML:**
- MedGemma 1.5-4b-it
- PyTorch
- Transformers (Hugging Face)
- JSON Schema validation

## 🚀 Deployment

### Quick Start
```bash
# Clone and start
./start_all.sh
```

Access at:
- Frontend: http://localhost:3002
- Backend API: http://localhost:8002
- API Documentation: http://localhost:8002/docs

### Docker Deployment
```bash
docker-compose up -d
```

## 📈 Impact & Differentiation

Unlike traditional EHR systems (individual-focused, cloud-dependent) or generic health apps (non-specialized, cloud-based), Family Health Copilot:

1. **Puts Families First**: Designed specifically for family caregiving coordination
2. **Respects Privacy**: Local-first with granular permissions
3. **Specializes in Medical Understanding**: Uses MedGemma, not generic AI
4. **Maintains Transparency**: Evidence-based, traceable AI outputs
5. **Stays Non-Diagnostic**: Clear boundaries, encourages professional consultation

## 🎯 Target Users

- **Primary**: Family caregivers managing aging parents' health remotely
- **Secondary**: Patients wanting to better understand their medical reports
- **Tertiary**: Healthcare providers (as informational support tool for patients)

## 🔮 Future Enhancements

Planned features include:
- Symptom checker for minor ailments
- Pre-visit preparation checklists
- Family communication aids for major diagnoses
- Remote consultation summary packs
- Integration with wearable health devices

## 📞 Important Disclaimer

**This system is designed for information understanding and family coordination ONLY. It does NOT constitute medical diagnosis or treatment advice. In case of emergency, please seek immediate medical attention.**

---

**Version**: 2.0.0
**Status**: Production Ready (MVP)
**Last Updated**: February 2026
**License**: Open Source (TBD)
