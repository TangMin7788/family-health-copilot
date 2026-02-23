"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { reportsApi } from "@/lib/api";
import {
  Stethoscope,
  FileText,
  Scan,
  LogOut,
  User,
  Activity,
  HeartPulse,
  Brain,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [quickStats, setQuickStats] = useState([
    { label: "Total Reports", value: "0", icon: FileText, color: "text-blue-600" },
    { label: "AI Consultations", value: "0", icon: Activity, color: "text-teal-600" },
    { label: "Images Analyzed", value: "0", icon: Scan, color: "text-purple-600" },
    { label: "Family Members", value: "0", icon: HeartPulse, color: "text-red-600" },
  ]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch stats from API
  const fetchStats = async () => {
    try {
      setIsLoading(true);

      // Fetch all reports for alice to get statistics
      const response = await reportsApi.list("alice");
      const reports = response.data;

      // Calculate unique family members from reports
      const uniqueOwners = new Set(reports.map((r) => r.owner));
      const familyMembersCount = uniqueOwners.size;

      // For demo purposes, we'll use report counts
      // In a real application, you'd have separate endpoints for consultation counts and image analysis counts
      const stats = [
        { label: "Total Reports", value: reports.length.toString(), icon: FileText, color: "text-blue-600" },
        { label: "AI Consultations", value: Math.floor(reports.length * 0.7).toString(), icon: Activity, color: "text-teal-600" },
        { label: "Images Analyzed", value: Math.floor(reports.length * 0.4).toString(), icon: Scan, color: "text-purple-600" },
        { label: "Family Members", value: familyMembersCount.toString(), icon: HeartPulse, color: "text-red-600" },
      ];

      setQuickStats(stats);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    fetchStats();

    // Set up interval to refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);

    return () => clearInterval(interval);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    router.push("/login");
  };

  const features = [
    {
      id: "health-database",
      title: "Family Health Database",
      description: "Store health reports and get AI-powered explanations of complex medical terminology",
      icon: FileText,
      color: "from-blue-400 to-indigo-400",
      route: "/",
      details: [
        "Physical exams & Lab results",
        "AI report interpretation",
        "Plain language explanations",
        "Family member management"
      ],
    },
    {
      id: "image-analysis",
      title: "Medical Image Analysis",
      description: "AI-powered analysis of X-rays, CT scans, MRIs, and other medical images",
      icon: Scan,
      color: "from-purple-400 to-pink-400",
      route: "/analyze-image",
      details: ["X-ray analysis", "CT scan review", "MRI interpretation"],
    },
    {
      id: "ai-doctor",
      title: "AI Doctor Consultation",
      description: "Chat with AI doctor for health advice, symptom analysis, and medication guidance",
      icon: Stethoscope,
      color: "from-teal-400 to-cyan-400",
      route: "/ai-doctor",
      details: ["Symptom analysis", "Treatment suggestions", "Medication guidance"],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/30">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-xl shadow-lg">
                <HeartPulse className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Family Health Copilot</h1>
                <p className="text-slate-300 text-sm">Health Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-lg">
                <User className="w-5 h-5 text-slate-300" />
                <span className="text-sm text-slate-300">
                  {localStorage.getItem("userEmail") || "Guest"}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-slate-600 text-white hover:bg-slate-800"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome to Your Health Workbench
          </h2>
          <p className="text-slate-600">
            Access all your family health management tools and AI-powered services
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickStats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-shadow relative"
            >
              {isLoading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl">
                  <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                </div>
                <stat.icon className={`w-10 h-10 ${stat.color} opacity-20`} />
              </div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Brain className="w-6 h-6 text-teal-600" />
            AI-Powered Features
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.id}
                className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group hover:-translate-y-1 flex flex-col h-full"
              >
                <div className="p-6 flex-1 flex flex-col">
                  {/* Icon */}
                  <div className={`inline-flex p-3 bg-gradient-to-br ${feature.color} rounded-xl mb-4 shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Title and Description */}
                  <h4 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h4>
                  <p className="text-slate-600 mb-4 text-sm">{feature.description}</p>

                  {/* Feature Details */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {feature.details.map((detail) => (
                      <span
                        key={detail}
                        className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium"
                      >
                        {detail}
                      </span>
                    ))}
                  </div>

                  {/* Spacer to push button to bottom */}
                  <div className="flex-1"></div>

                  {/* Action Buttons */}
                  <div className="mt-auto flex justify-center">
                    <Button
                      onClick={() => router.push(feature.route)}
                      className={`w-full shadow-lg bg-gradient-to-r ${feature.color} hover:opacity-90`}
                      size="sm"
                    >
                      {feature.id === "ai-doctor" ? "Consult" : feature.id === "health-database" ? "View Reports" : "Analyse"}
                    </Button>
                  </div>
                </div>

                {/* Bottom Accent */}
                <div className={`h-2 bg-gradient-to-r ${feature.color}`}></div>
              </div>
            );
          })}
        </div>

        {/* Quick Tips */}
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 border border-teal-200">
          <h4 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
            💡 Quick Tips
          </h4>
          <ul className="space-y-2 text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-teal-600 mt-1">•</span>
              <span>Start with <strong>AI Doctor Consultation</strong> for immediate health questions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-600 mt-1">•</span>
              <span>Use <strong>Family Health Database</strong> to store reports and get AI-powered explanations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-600 mt-1">•</span>
              <span>Upload medical images for <strong>AI Analysis</strong> to get insights on X-rays and scans</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 py-6 bg-slate-900 text-slate-400">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">⚠️ <strong>Disclaimer:</strong> AI suggestions are for information only and do not constitute medical advice.</p>
          <p className="text-sm">© 2026 Family Health Copilot. Version 2.0.0</p>
        </div>
      </footer>
    </div>
  );
}
