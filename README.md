# Family Health Copilot

> AI-powered medical report analysis system for family health management

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![Next.js 14](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)

## 🌟 Overview

**Family Health Copilot** is a privacy-first, AI-powered system that helps families understand and manage medical reports together. It transforms complex medical terminology into easy-to-understand explanations while maintaining strict privacy controls.

### Key Features

- 🏥 **Intelligent Medical Analysis** - Powered by MedGemma 1.5 AI model for accurate medical report understanding
- 👨‍👩‍👧‍👦 **Family Collaboration** - Multi-user support with role-based access control
- 🔒 **Privacy-First** - Local processing, automatic PII redaction, three-tier permission system
- 💡 **Dual-View Explanations** - Patient view and family caregiver view
- 🚨 **Risk Triage** - Automatic urgency classification (ROUTINE/MEDIUM/HIGH/EMERGENCY)
- 📊 **Evidence-Based** - Every AI claim links back to source text
- 🎨 **Modern UI** - Responsive Next.js interface with teal-cyan gradient theme

## 🚀 Quick Start

### Prerequisites

- Python 3.10 or higher
- Node.js 18 or higher
- 8GB+ RAM (for AI model)
- Ollama installed (for MedGemma model)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/family-health-copilot.git
cd family-health-copilot

# Install backend dependencies
cd backend
pip install -r requirements.txt

# Install frontend dependencies
cd ../frontend
npm install

# Pull MedGemma model (requires Ollama)
ollama pull medgemma1.5-4b-it
```

### Running the Application

```bash
# Start both frontend and backend
./start_all.sh

# Or start individually:
# Backend: cd backend && uvicorn app.main:app --reload --port 8002
# Frontend: cd frontend && npm run dev
```

Access at:
- **Frontend**: http://localhost:3002
- **Backend API**: http://localhost:8002
- **API Docs**: http://localhost:8002/docs

## 📖 Usage

### 1. Upload a Medical Report

Upload radiology reports (PDF, images) through the web interface.

### 2. AI Analysis

The system automatically:
- Extracts structured data (findings, impressions, entities)
- Identifies critical findings and urgency levels
- Redacts personal information (PII)
- Generates patient-friendly and caregiver-friendly summaries

### 3. Family Sharing

Set privacy levels for each report:
- **PRIVATE** - Only you can view
- **SHARED_SUMMARY** - Family sees summaries (not raw reports)
- **CAREGIVER** - Extended access for designated caregivers

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React Query
- Axios

**Backend:**
- FastAPI
- SQLAlchemy
- Pydantic
- SQLite
- Uvicorn

**AI/ML:**
- MedGemma 1.5-4b-it
- PyTorch
- Transformers (Hugging Face)
- JSON Schema validation

### Project Structure

```
family-health-copilot/
├── frontend/           # Next.js frontend application
│   ├── app/           # Next.js app router pages
│   ├── components/    # React components
│   └── lib/           # Utility functions
├── backend/           # FastAPI backend application
│   └── app/           # API modules
│       ├── api/       # API routes
│       ├── core/      # Configuration
│       ├── models/    # Database models
│       └── services/  # Business logic
├── utils/             # Shared utilities
├── schemas/           # JSON schemas for AI validation
└── start_all.sh       # Startup script
```

## 🛡️ Privacy & Security

- ✅ **Local-First** - All AI processing happens locally, no cloud uploads
- ✅ **PII Redaction** - Automatic removal of names, emails, phone numbers, IDs
- ✅ **Granular Permissions** - Three-tier access control model
- ✅ **Evidence Tracking** - All AI claims traceable to source text
- ✅ **Non-Diagnostic** - Clear boundaries on system capabilities

## ⚠️ Disclaimer

**This system is designed for information understanding and family coordination ONLY. It does NOT constitute medical diagnosis or treatment advice.**

- Always consult healthcare professionals for medical decisions
- In case of emergency, seek immediate medical attention
- AI analysis may contain errors or omissions
- Use as informational support, not as a substitute for professional medical advice

## 📚 Documentation

- [Architecture Overview](ARCHITECTURE.md)
- [API Documentation](http://localhost:8002/docs) (when running)
- [Database Schema](DATABASE_SETUP_SUMMARY.md)
- [Implementation Status](IMPLEMENTATION_STATUS.md)
- [Project Description](PROJECT_DESCRIPTION.md)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **MedGemma** - Medical AI model for report analysis
- **FastAPI** - Modern Python web framework
- **Next.js** - React framework for production
- **Ollama** - Local AI model runtime

## 📞 Contact

For questions, issues, or suggestions, please:
- Open an issue on GitHub
- Start a discussion in GitHub Discussions

---

**Version**: 2.0.0
**Status**: Production Ready (MVP)
**Last Updated**: February 2026

---

⚠️ **Healthcare Disclaimer**: This tool is for informational purposes only and should not replace professional medical advice, diagnosis, or treatment.
