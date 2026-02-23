"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useReports } from "@/hooks/use-reports";
import { PageHeader } from "@/components/dashboard/header";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ReportCard } from "@/components/reports/report-card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Plus, Loader2, ImageIcon } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [viewer, setViewer] = useState("alice");
  const { data: reports, isLoading, error } = useReports(viewer);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [router]);

  const handleAddReport = () => {
    router.push("/add");
  };

  const handleAnalyzeImage = () => {
    router.push("/analyze-image");
  };

  const handleViewReport = (id: number) => {
    router.push(`/reports/${id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading your health dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Oops!</h2>
          <p className="text-slate-600 mb-4">Failed to load reports. Please try again.</p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-left">
            <p className="text-sm font-semibold text-red-900 mb-2">Error Details:</p>
            <p className="text-xs text-red-700 break-words">
              {error instanceof Error ? error.message : JSON.stringify(error)}
            </p>
          </div>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  const metrics = {
    total: reports?.length || 0,
    urgent: reports?.filter(r => r.urgency === "HIGH" || r.urgency === "EMERGENCY").length || 0,
    routine: reports?.filter(r => r.urgency === "LOW").length || 0,
    shared: reports?.filter(r => r.visibility !== "PRIVATE").length || 0,
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl">💝</div>
              <div>
                <h1 className="text-3xl font-bold">Family Health Copilot</h1>
                <p className="text-slate-300">AI-Powered Medical Report Analysis</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-sm text-slate-300">Backend Connected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <PageHeader
          title="Family Health Dashboard"
          subtitle="Your trusted companion for understanding medical reports together"
          icon="🏠"
        />

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="w-full md:w-auto">
            <Select
              label="View As"
              value={viewer}
              onChange={(e) => setViewer(e.target.value)}
              className="w-full md:w-64"
            >
              <option value="alice">👤 Alice (Self)</option>
              <option value="bob">👨 Bob (Family Member)</option>
              <option value="caregiver">🏥 Caregiver</option>
            </Select>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => router.push("/dashboard")}
              size="lg"
              variant="outline"
              className="shadow-lg"
            >
              🏠 Dashboard
            </Button>
            <Button
              onClick={() => router.push("/ai-doctor")}
              size="lg"
              variant="outline"
              className="shadow-lg"
            >
              👨‍⚕️ AI Doctor
            </Button>
            <Button
              onClick={handleAnalyzeImage}
              size="lg"
              variant="outline"
              className="shadow-lg"
            >
              <ImageIcon className="w-5 h-5 mr-2" />
              Analyze Image
            </Button>
            <Button
              onClick={handleAddReport}
              size="lg"
              className="shadow-xl shadow-teal-500/30"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Report
            </Button>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Reports"
            value={metrics.total}
            icon="📋"
            color="teal"
          />
          <MetricCard
            title="Needs Attention"
            value={metrics.urgent}
            icon="⚠️"
            color="orange"
          />
          <MetricCard
            title="Routine"
            value={metrics.routine}
            icon="✅"
            color="blue"
          />
          <MetricCard
            title="Shared"
            value={metrics.shared}
            icon="👨‍👩‍👧‍👦"
            color="purple"
          />
        </div>

        {/* Reports List */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span>📋</span>
            Recent Reports
          </h2>
          <p className="text-slate-600 mt-1">
            {reports?.length || 0} report{(reports?.length || 0) !== 1 ? "s" : ""} found
          </p>
        </div>

        {!reports || reports.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-xl">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No Reports Yet</h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              Get started by adding your first medical report. Our AI will help you understand it in simple terms.
            </p>
            <Button onClick={handleAddReport} size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Report
            </Button>
          </div>
        ) : (
          <div className="space-y-4 fade-in">
            {reports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onView={handleViewReport}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-16 py-8 bg-slate-900 text-slate-300">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">⚠️ <strong>Disclaimer:</strong> This system is for information only and does not constitute medical advice.</p>
          <p className="text-sm text-slate-400">© 2026 Family Health Copilot. Version 2.0.0</p>
        </div>
      </footer>
    </div>
  );
}
