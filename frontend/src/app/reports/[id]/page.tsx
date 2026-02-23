"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useReport } from "@/hooks/use-reports";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Calendar, FileText, Download, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { formatDate, getUrgencyColor, getUrgencyIcon, getVisibilityLabel } from "@/lib/utils";

export default function ReportDetailPage() {
  const router = useRouter();
  const params = useParams();
  const reportId = parseInt(params.id as string);
  const { data: report, isLoading, error } = useReport(reportId);

  // UI state
  const [showStructuredData, setShowStructuredData] = useState(false);
  const [selectedView, setSelectedView] = useState<"patient" | "family" | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<"txt" | "pdf" | null>(null);

  // Toggle structured data visibility
  const toggleStructuredData = () => {
    setShowStructuredData(!showStructuredData);
  };

  // Select view type
  const selectView = (viewType: "patient" | "family") => {
    setSelectedView(selectedView === viewType ? null : viewType);
  };

  // Export structured data as TXT
  const exportStructuredDataAsTxt = () => {
    if (!report || !report.extracted) return;

    const extracted = report.extracted;

    const content = `
╔═══════════════════════════════════════════════════════════════════╗
║     STRUCTURED MEDICAL DATA EXPORT - PRIVACY PROTECTED           ║
║                      🔒 DE-IDENTIFIED 🔒                          ║
╚═══════════════════════════════════════════════════════════════════╝

📋 EXPORT INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Report ID:     ${report.id}
  Owner:         ${report.owner}
  Created:       ${formatDate(report.created_at)}
  Export Date:   ${new Date().toLocaleString()}
  System:        Family Health Copilot v2.0.0

🔒 PRIVACY NOTICE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✓ Personal information has been REDACTED
  ✓ Patient names, IDs, and sensitive dates are MASKED
  ✓ Safe for sharing with healthcare providers
  ✓ Does NOT contain protected health information (PHI)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 STRUCTURED DATA EXTRACTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. STUDY INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Modality:      ${extracted.study?.modality || 'N/A'}
   Body Part:     ${extracted.study?.body_part || 'N/A'}
   Indication:    ${extracted.study?.indication || 'N/A'}

2. FINDINGS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${extracted.sections?.findings || 'N/A'}

3. IMPRESSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${extracted.sections?.impression || 'N/A'}

4. DETECTED ENTITIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${extracted.entities && extracted.entities.length > 0
  ? extracted.entities.map((e: any) => `
   • ${e.entity || 'N/A'}
      - Anatomy:     ${e.anatomy || 'N/A'}
      - Certainty:   ${e.certainty || 'N/A'}
      - Severity:    ${e.severity || 'N/A'}
      - Temporal:    ${e.temporal || 'N/A'}
      - Evidence:    ${e.evidence || 'N/A'}
`).join('')
  : '   No entities detected'}

5. CRITICAL FLAGS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${extracted.critical_flags && extracted.critical_flags.length > 0
  ? extracted.critical_flags.map((f: any) => `
   ⚠️  ${f.flag || 'Alert'} (${f.status || 'N/A'})
      Evidence: ${f.evidence || 'N/A'}
`).join('')
  : '   ✓ No critical flags detected'}

6. QUALITY CHECKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   JSON Valid:    ${extracted.quality_checks?.json_valid ? '✓ Yes' : '✗ No'}
   Missing:       ${extracted.quality_checks?.missing_sections?.join(', ') || 'None'}
   Notes:         ${extracted.quality_checks?.notes || 'N/A'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  DISCLAIMER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  This structured data is AI-extracted and for informational purposes only.
  It does not constitute medical advice or diagnosis.
  In case of emergency, please seek immediate medical attention.

╚═══════════════════════════════════════════════════════════════════╝
    `.trim();

    // Create a temporary printable element
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const doc = printWindow.document;
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Structured Data - Report ${report.id}</title>
            <style>
              body {
                font-family: 'Courier New', monospace;
                font-size: 12px;
                line-height: 1.6;
                padding: 20px;
                white-space: pre-wrap;
              }
            </style>
          </head>
          <body>${content.replace(/\n/g, '<br/>')}</body>
        </html>
      `);
      doc.close();
      printWindow.print();
    }

    // Also download as TXT file
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `structured-data-${report.id}-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export original report as TXT
  const exportOriginalAsTxt = () => {
    if (!report) return;

    const content = `
╔═══════════════════════════════════════════════════════════════════╗
║           FAMILY HEALTH COPILOT - Medical Report Export          ║
║                     🔒 PRIVACY PROTECTED 🔒                      ║
╚═══════════════════════════════════════════════════════════════════╝

📋 REPORT INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Report ID:     ${report.id}
  Owner:         ${report.owner}
  Created:       ${formatDate(report.created_at)}
  Urgency:       ${report.urgency}
  Status:        ${report.status}
  Visibility:    ${getVisibilityLabel(report.visibility)}

🔒 DATA PRIVACY NOTICE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ⚠️  This export contains REDACTED/DE-IDENTIFIED data only.
  ⚠️  All personal identifiers (PHI) have been removed.
  ⚠️  Patient names, dates of birth, and IDs are masked.
  ⚠️  This data is safe for sharing with healthcare providers.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 ORIGINAL REPORT TEXT (REDACTED)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🔒 Personal information has been removed for privacy protection

${report.report_text}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  DISCLAIMER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  This report is for informational purposes only and does not
  constitute medical advice. In case of emergency, please seek
  immediate medical attention.

  Exported on: ${new Date().toLocaleString()}
  Exported by: ${report.owner}
  System: Family Health Copilot v2.0.0
╚═══════════════════════════════════════════════════════════════════╝
    `.trim();

    // Create a temporary printable element
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const doc = printWindow.document;
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Medical Report ${report.id}</title>
            <style>
              body {
                font-family: 'Courier New', monospace;
                font-size: 12px;
                line-height: 1.6;
                padding: 20px;
                white-space: pre-wrap;
              }
            </style>
          </head>
          <body>${content.replace(/\n/g, '<br/>')}</body>
        </html>
      `);
      doc.close();
      printWindow.print();
    }

    // Also download as TXT file
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `medical-report-${report.id}-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export as PDF (using browser print)
  const exportAsPDF = () => {
    if (!report) return;

    // For PDF export, we use browser print functionality
    // The actual content to be printed will be styled with @media print
    window.print();
  };

  // Export Patient View as TXT
  const exportPatientViewAsTxt = () => {
    if (!report || !report.patient_view) return;

    const content = `
╔═══════════════════════════════════════════════════════════════════╗
║           FAMILY HEALTH COPILOT - Patient View Export          ║
║                     🔒 PRIVACY PROTECTED 🔒                      ║
╚═══════════════════════════════════════════════════════════════════╝

📋 REPORT INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Report ID:     ${report.id}
  Owner:         ${report.owner}
  Created:       ${formatDate(report.created_at)}
  View Type:     Patient View
  Export Date:   ${new Date().toLocaleString()}
  System:        Family Health Copilot v2.0.0

🔒 PRIVACY NOTICE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✓ This is a patient-friendly explanation of the medical report
  ✓ Medical jargon translated into plain language
  ✓ All personal identifiers have been removed
  ✓ Safe for sharing with healthcare providers

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧑‍⚕️ PATIENT VERSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${report.patient_view}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  DISCLAIMER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  This explanation is for informational purposes only and does not
  constitute medical advice. In case of emergency, please seek
  immediate medical attention.

╚═══════════════════════════════════════════════════════════════════╝
    `.trim();

    // Create a temporary printable element
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const doc = printWindow.document;
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Patient View - Report ${report.id}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                font-size: 14px;
                line-height: 1.8;
                padding: 40px;
                max-width: 800px;
                margin: 0 auto;
              }
              h1, h2, h3 { color: #1e40af; }
              ul, ol { margin: 1em 0; }
              li { margin: 0.5em 0; }
            </style>
          </head>
          <body>${report.patient_view.replace(/\n/g, '<br/>')}</body>
        </html>
      `);
      doc.close();
      printWindow.print();
    }

    // Also download as TXT file
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `patient-view-${report.id}-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export Family View as TXT
  const exportFamilyViewAsTxt = () => {
    if (!report || !report.family_view) return;

    const content = `
╔═══════════════════════════════════════════════════════════════════╗
║           FAMILY HEALTH COPILOT - Family View Export          ║
║                     🔒 PRIVACY PROTECTED 🔒                      ║
╚═══════════════════════════════════════════════════════════════════╝

📋 REPORT INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Report ID:     ${report.id}
  Owner:         ${report.owner}
  Created:       ${formatDate(report.created_at)}
  View Type:     Family View
  Export Date:   ${new Date().toLocaleString()}
  System:        Family Health Copilot v2.0.0

🔒 PRIVACY NOTICE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✓ This is a family-oriented summary with action items
  ✓ Designed for family members and caregivers
  ✓ All personal identifiers have been removed
  ✓ Safe for sharing with healthcare providers

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👨‍👩‍👧‍👦 FAMILY VERSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${report.family_view}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  DISCLAIMER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  This summary is for informational purposes only and does not
  constitute medical advice. In case of emergency, please seek
  immediate medical attention.

╚═══════════════════════════════════════════════════════════════════╝
    `.trim();

    // Create a temporary printable element
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const doc = printWindow.document;
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Family View - Report ${report.id}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                font-size: 14px;
                line-height: 1.8;
                padding: 40px;
                max-width: 800px;
                margin: 0 auto;
              }
              h1, h2, h3 { color: #d97706; }
              ul, ol { margin: 1em 0; }
              li { margin: 0.5em 0; }
            </style>
          </head>
          <body>${report.family_view.replace(/\n/g, '<br/>')}</body>
        </html>
      `);
      doc.close();
      printWindow.print();
    }

    // Also download as TXT file
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `family-view-${report.id}-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle export button click
  const handleExport = async (format: "txt" | "pdf", contentType: "original" | "structured") => {
    setIsExporting(true);
    setExportFormat(format);
    try {
      if (contentType === "structured") {
        if (format === "txt") {
          exportStructuredDataAsTxt();
        } else {
          exportAsPDF();
        }
      } else {
        if (format === "txt") {
          exportOriginalAsTxt();
        } else {
          exportAsPDF();
        }
      }
    } finally {
      setTimeout(() => {
        setIsExporting(false);
        setExportFormat(null);
      }, 500);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/30">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading report details...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/30">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Report Not Found</h2>
          <p className="text-slate-600 mb-4">The report you're looking for doesn't exist.</p>
          <Button onClick={() => router.push("/")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Print styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-break-before {
            page-break-before: always;
          }
          body {
            background: white !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/30">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white no-print">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <Button
                onClick={() => router.back()}
                variant="ghost"
                className="text-white hover:bg-slate-700"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Button>
              <div className="text-right">
                <h1 className="text-2xl font-bold">Report #{report.id}</h1>
                <p className="text-slate-300">Medical Report Analysis</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="container mx-auto px-4 py-8">
          {/* Report info header */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 no-print">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Badge className={getUrgencyColor(report.urgency)}>
                    {getUrgencyIcon(report.urgency)} {report.urgency}
                  </Badge>
                  <Badge variant="info">
                    {getVisibilityLabel(report.visibility)}
                  </Badge>
                  <Badge variant="default">
                    <User className="w-3 h-3 mr-1" />
                    {report.owner}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(report.created_at)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Patient View & Family View Buttons */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6 no-print">
            <div className="p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">📋 Report Interpretations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Patient View Button */}
                <button
                  onClick={() => selectView("patient")}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    selectedView === "patient"
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:border-blue-300 hover:bg-blue-50/50"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                      selectedView === "patient" ? "bg-blue-500" : "bg-blue-100"
                    }`}>
                      🧑‍⚕️
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Patient View</h3>
                      <p className="text-sm text-slate-600">Easy-to-understand explanation</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">
                    Medical jargon translated into plain language for you
                  </p>
                </button>

                {/* Family View Button */}
                <button
                  onClick={() => selectView("family")}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    selectedView === "family"
                      ? "border-amber-500 bg-amber-50"
                      : "border-slate-200 hover:border-amber-300 hover:bg-amber-50/50"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                      selectedView === "family" ? "bg-amber-500" : "bg-amber-100"
                    }`}>
                      👨‍👩‍👧‍👦
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Family View</h3>
                      <p className="text-sm text-slate-600">Caregiver-oriented summary</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">
                    Actionable insights for family members and caregivers
                  </p>
                </button>
              </div>

              {/* Selected View Content */}
              {selectedView && (
                <div className="mt-6 rounded-xl overflow-hidden border-2 transition-all">
                  {selectedView === "patient" ? (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          🧑‍⚕️ Patient Version
                        </h3>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => exportPatientViewAsTxt()}
                            disabled={isExporting}
                            size="sm"
                            variant="secondary"
                            className="bg-white/20 hover:bg-white/30 text-white border-0"
                          >
                            {isExporting ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4 mr-2" />
                            )}
                            Export TXT
                          </Button>
                          <Button
                            onClick={() => exportAsPDF()}
                            disabled={isExporting}
                            size="sm"
                            variant="secondary"
                            className="bg-white/20 hover:bg-white/30 text-white border-0"
                          >
                            {isExporting ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4 mr-2" />
                            )}
                            Export PDF
                          </Button>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="bg-white rounded-xl p-6 prose prose-slate max-w-none">
                          {report.patient_view ? (
                            <div className="whitespace-pre-wrap text-sm text-slate-700">
                              {report.patient_view}
                            </div>
                          ) : (
                            <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-xl p-4">
                              <p className="text-amber-800">⚠️ No patient explanation available. The report analysis may have failed.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                      <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          👨‍👩‍👧‍👦 Family Version
                        </h3>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => exportFamilyViewAsTxt()}
                            disabled={isExporting}
                            size="sm"
                            variant="secondary"
                            className="bg-white/20 hover:bg-white/30 text-white border-0"
                          >
                            {isExporting ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4 mr-2" />
                            )}
                            Export TXT
                          </Button>
                          <Button
                            onClick={() => exportAsPDF()}
                            disabled={isExporting}
                            size="sm"
                            variant="secondary"
                            className="bg-white/20 hover:bg-white/30 text-white border-0"
                          >
                            {isExporting ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4 mr-2" />
                            )}
                            Export PDF
                          </Button>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="bg-white rounded-xl p-6 prose prose-slate max-w-none">
                          {report.family_view ? (
                            <div className="whitespace-pre-wrap text-sm text-slate-700">
                              {report.family_view}
                            </div>
                          ) : (
                            <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-xl p-4">
                              <p className="text-amber-800">⚠️ No family explanation available. The report analysis may have failed.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Original Report Section */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-white" />
                  <h2 className="text-xl font-bold text-white">Original Report Text</h2>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleExport("txt", "original")}
                    disabled={isExporting}
                    size="sm"
                    variant="secondary"
                    className="bg-white/20 hover:bg-white/30 text-white border-0"
                  >
                    {isExporting && exportFormat === "txt" ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    Export TXT
                  </Button>
                  <Button
                    onClick={() => handleExport("pdf", "original")}
                    disabled={isExporting}
                    size="sm"
                    variant="secondary"
                    className="bg-white/20 hover:bg-white/30 text-white border-0"
                  >
                    {isExporting && exportFormat === "pdf" ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    Export PDF
                  </Button>
                </div>
              </div>
              <p className="text-sm text-blue-100 mt-2">
                🔒 Personal information has been removed for privacy protection
              </p>
            </div>
            <div className="p-6">
              <pre className="whitespace-pre-wrap text-sm text-slate-700 bg-slate-50 rounded-xl p-4 overflow-x-auto max-h-96">
                {report.report_text}
              </pre>
            </div>
          </div>

          {/* Structured Data Extraction Button */}
          {report.extracted && (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <button
                onClick={toggleStructuredData}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4 flex items-center justify-between hover:from-emerald-600 hover:to-teal-700 transition-all"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-white" />
                  <div className="text-left">
                    <h2 className="text-xl font-bold text-white">Structured Data Extraction</h2>
                    <p className="text-sm text-emerald-100">AI-extracted structured information from the report</p>
                  </div>
                </div>
                {showStructuredData ? (
                  <ChevronUp className="w-6 h-6 text-white" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-white" />
                )}
              </button>

              {showStructuredData && (
                <div className="p-6">
                  {/* Export buttons for structured data */}
                  <div className="flex gap-2 mb-6 no-print">
                    <Button
                      onClick={() => handleExport("txt", "structured")}
                      disabled={isExporting}
                      size="sm"
                      variant="outline"
                      className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                    >
                      {isExporting && exportFormat === "txt" ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 mr-2" />
                      )}
                      Export as TXT
                    </Button>
                    <Button
                      onClick={() => handleExport("pdf", "structured")}
                      disabled={isExporting}
                      size="sm"
                      variant="outline"
                      className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                    >
                      {isExporting && exportFormat === "pdf" ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 mr-2" />
                      )}
                      Export as PDF
                    </Button>
                  </div>

                  {/* Structured data content */}
                  <div className="bg-emerald-50 rounded-xl p-6 overflow-x-auto">
                    <pre className="whitespace-pre-wrap text-xs text-slate-700">
                      {JSON.stringify(report.extracted, null, 2)}
                    </pre>
                  </div>

                  {/* Privacy notice */}
                  <div className="mt-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-xl p-4">
                    <p className="text-sm text-amber-800">
                      <strong>🔒 Privacy Protected:</strong> This structured data contains only de-identified information.
                      Personal identifiers have been removed. Safe for sharing with healthcare providers.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Print-only header */}
          <div className="hidden print:block print:mb-8">
            <div className="text-center border-b-2 border-slate-300 pb-4 mb-4">
              <h1 className="text-2xl font-bold">Family Health Copilot</h1>
              <p className="text-slate-600">Medical Report Analysis</p>
              <p className="text-sm text-slate-500 mt-2">
                Report ID: {report.id} | Owner: {report.owner} | Date: {formatDate(report.created_at)}
              </p>
            </div>
            <div className="text-xs text-slate-500 text-center mb-4">
              ⚠️ This report is for informational purposes only and does not constitute medical advice.
              <br />
              Exported on {new Date().toLocaleString()}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 py-8 bg-slate-900 text-slate-300 no-print">
          <div className="container mx-auto px-4 text-center">
            <p className="mb-2">⚠️ <strong>Disclaimer:</strong> This system is for information only and does not constitute medical advice.</p>
            <p className="text-sm text-slate-400">In case of emergency, please seek immediate medical attention.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
