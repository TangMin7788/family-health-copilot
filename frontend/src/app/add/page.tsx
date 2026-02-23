"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateReport } from "@/hooks/use-reports";
import { PageHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, CheckCircle2, AlertCircle } from "lucide-react";

export default function AddReportPage() {
  const router = useRouter();
  const createReport = useCreateReport();

  const [owner, setOwner] = useState("alice");
  const [visibility, setVisibility] = useState("SHARED_SUMMARY");
  const [reportText, setReportText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!reportText.trim()) {
      setError("Please paste your medical report text before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createReport.mutateAsync({
        owner,
        visibility,
        report_text: reportText,
      });

      setSuccess(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push(`/reports/${response.data.id}`);
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Failed to create report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-3xl font-bold">Add Medical Report</h1>
                <p className="text-slate-300">AI-powered analysis for better understanding</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Add Medical Report"
          subtitle="Paste your radiology or medical report for AI-powered analysis"
          icon="➕"
        />

        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Report Owner"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
              >
                <option value="alice">👤 Alice</option>
                <option value="bob">👨 Bob</option>
              </Select>

              <Select
                label="Privacy Level"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
              >
                <option value="PRIVATE">🔒 Private (Only Me)</option>
                <option value="SHARED_SUMMARY">👨‍👩‍👧‍👦 Family Shared</option>
                <option value="CAREGIVER">🏥 Caregiver Access</option>
              </Select>
            </div>

            <Textarea
              label="Paste Report Text"
              placeholder="Paste the complete text of your radiology or medical report here...&#10;&#10;Example:&#10;CT CHEST WITH CONTRAST&#10;&#10;CLINICAL INDICATION:&#10;58-year-old female with history of breast cancer...&#10;&#10;FINDINGS:&#10;Lungs: Multiple small pulmonary nodules...&#10;&#10;IMPRESSION:&#10;1. Stable pulmonary nodules..."
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              rows={20}
              className="text-sm"
            />

            {/* Privacy notice */}
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border-l-4 border-teal-500 rounded-r-xl p-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">🔒</div>
                <div>
                  <h4 className="font-semibold text-teal-900 mb-1">Privacy Protected</h4>
                  <p className="text-sm text-teal-700">
                    Your personal information (phone numbers, emails, IDs) will be automatically removed before processing.
                    Your data is stored securely and never shared with third parties.
                  </p>
                </div>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-r-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-900 mb-1">Error</h4>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className="bg-emerald-50 border-l-4 border-emerald-500 rounded-r-xl p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-emerald-900 mb-1">Report Submitted Successfully!</h4>
                  <p className="text-sm text-emerald-700">
                    Your report is being processed. Redirecting to the results page...
                  </p>
                </div>
              </div>
            )}

            {/* Submit button */}
            <div className="flex gap-4">
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting || success}
                className="flex-1 shadow-xl shadow-teal-500/30"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-2" />
                    Analyze Report
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => router.back()}
                disabled={isSubmitting || success}
              >
                Cancel
              </Button>
            </div>

            {/* Processing notice */}
            {isSubmitting && (
              <div className="text-center text-sm text-slate-600 bg-slate-50 rounded-xl p-4">
                <p className="font-medium mb-2">⏳ Processing your report...</p>
                <p>This may take 15-30 seconds. Please don't close this page.</p>
              </div>
            )}
          </form>

          {/* Tips */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <span>💡</span> Tips for Best Results
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-600">✓</span>
                <span>Include the complete report text, not just summaries</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">✓</span>
                <span>Use English reports for best AI understanding</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">✓</span>
                <span>Ensure the text includes findings and impression sections</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">✓</span>
                <span>Remove any images or tables - paste text only</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 py-8 bg-slate-900 text-slate-300">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">⚠️ <strong>Disclaimer:</strong> This system is for information only and does not constitute medical advice.</p>
        </div>
      </footer>
    </div>
  );
}
