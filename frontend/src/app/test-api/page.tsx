"use client";

import { useEffect, useState } from "react";

export default function TestApiPage() {
  const [status, setStatus] = useState<string>("Loading...");
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testApi = async () => {
      try {
        setStatus("Testing API connection...");

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8003/api/v1';
        console.log("🔍 API URL:", apiBaseUrl);
        console.log("🔍 Current URL:", typeof window !== "undefined" ? window.location.href : "SSR");

        // Test 1: Direct fetch to health endpoint
        console.log("Test 1: Health check");
        const healthResponse = await fetch(`http://localhost:8003/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        console.log("Health response status:", healthResponse.status);
        const healthData = await healthResponse.json();
        console.log("Health check result:", healthData);

        // Test 2: Reports API with full URL
        console.log("Test 2: Reports API");
        const reportsResponse = await fetch(`http://localhost:8003/api/v1/reports?viewer=alice`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        console.log("Reports response status:", reportsResponse.status);
        const reportsData = await reportsResponse.json();
        console.log("Reports result:", reportsData);

        setStatus("✅ API connection successful!");
        setData({ health: healthData, reportsCount: reportsData.length });
      } catch (err: any) {
        console.error("❌ API test failed:", err);
        setStatus("❌ API connection failed!");
        setError(err.message || JSON.stringify(err));
      }
    };

    testApi();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">API Connection Test</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <h2 className="text-xl font-semibold mb-2">Status</h2>
          <p className="text-lg">{status}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
            <h2 className="text-xl font-semibold mb-2 text-red-900">Error</h2>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {data && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-4">
            <h2 className="text-xl font-semibold mb-2 text-green-900">Success</h2>
            <pre className="text-green-700 overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2 text-blue-900">Environment</h2>
          <p className="text-blue-700">
            API URL: {process.env.NEXT_PUBLIC_API_URL || "Not set"}
          </p>
          <p className="text-blue-700">
            Node URL: {typeof window !== "undefined" ? window.location.href : "SSR"}
          </p>
        </div>
      </div>
    </div>
  );
}
