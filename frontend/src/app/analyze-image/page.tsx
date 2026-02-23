"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { modelsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { FormattedAnalysis } from "@/components/analysis/formatted-analysis";
import { Upload, Loader2, Image as ImageIcon, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function AnalyzeImagePage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("Describe this medical image in detail");
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingTime, setProcessingTime] = useState<number | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image file is too large. Maximum size is 10MB.");
      return;
    }

    setSelectedFile(file);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError("Please select an image first");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);
    setProcessingTime(null);

    try {
      const response = await modelsApi.analyzeImage(selectedFile, prompt);
      setAnalysis(response.data.analysis);
      setProcessingTime(response.data.processing_time_ms);
    } catch (err: any) {
      console.error("Image analysis failed:", err);
      setError(err.response?.data?.detail || err.message || "Failed to analyze image. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setAnalysis(null);
    setError(null);
    setProcessingTime(null);
  };

  const predefinedPrompts = [
    "Describe this medical image in detail",
    "What are the key findings in this X-ray?",
    "Is there anything abnormal in this image?",
    "Describe the anatomy visible in this image",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-4">
              <div className="text-4xl">🩺</div>
              <div>
                <h1 className="text-3xl font-bold">Medical Image Analysis</h1>
                <p className="text-slate-300">AI-powered analysis using MedGemma</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Upload and controls */}
          <div className="space-y-6">
            {/* Upload section */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <ImageIcon className="w-6 h-6 text-teal-600" />
                Upload Medical Image
              </h2>

              {!preview ? (
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-teal-500 transition-colors">
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="w-16 h-16 text-slate-400 mb-4" />
                    <p className="text-lg font-semibold text-slate-700 mb-2">
                      Click to upload an image
                    </p>
                    <p className="text-sm text-slate-500">
                      Supports: JPEG, PNG, DICOM (as image) • Max 10MB
                    </p>
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-auto rounded-lg border border-slate-200"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleReset}
                      className="absolute top-2 right-2"
                    >
                      Remove
                    </Button>
                  </div>
                  <p className="text-sm text-slate-600">
                    Selected: {selectedFile?.name}
                  </p>
                </div>
              )}
            </div>

            {/* Prompt section */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Analysis Prompt</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Quick Prompts
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {predefinedPrompts.map((predefinedPrompt) => (
                      <button
                        key={predefinedPrompt}
                        onClick={() => setPrompt(predefinedPrompt)}
                        className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                          prompt === predefinedPrompt
                            ? "bg-teal-50 border-teal-500 text-teal-700"
                            : "bg-white border-slate-300 text-slate-700 hover:border-teal-500"
                        }`}
                      >
                        {predefinedPrompt.length > 30
                          ? predefinedPrompt.substring(0, 30) + "..."
                          : predefinedPrompt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Custom Prompt
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter your custom analysis prompt..."
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  onClick={handleAnalyze}
                  disabled={!selectedFile || isAnalyzing}
                  size="lg"
                  className="flex-1 shadow-xl shadow-teal-500/30"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Analyze Image
                    </>
                  )}
                </Button>
              </div>

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-red-900 mb-1">Error</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Results */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-teal-600" />
                Analysis Results
              </h2>

              {!analysis ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-slate-600">
                    Upload an image and click "Analyze Image" to see results here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {processingTime && (
                    <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                      <p className="text-sm font-semibold text-teal-900">
                        Processing Time: {processingTime.toFixed(0)}ms
                      </p>
                    </div>
                  )}

                  <div className="bg-slate-50 rounded-lg p-6">
                    {/* Debug: show raw analysis */}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="mb-4 p-2 bg-gray-100 text-xs">
                        Debug: analysis length = {analysis?.length}
                      </div>
                    )}
                    <FormattedAnalysis analysis={analysis} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 py-8 bg-slate-900 text-slate-300">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">
            ⚠️ <strong>Disclaimer:</strong> This system is for information only and does not
            constitute medical advice.
          </p>
          <p className="text-sm text-slate-400">
            © 2026 Family Health Copilot. Version 2.0.0
          </p>
        </div>
      </footer>
    </div>
  );
}
