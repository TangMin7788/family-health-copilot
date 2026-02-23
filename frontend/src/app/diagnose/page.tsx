"use client";

import { useEffect, useState } from "react";

export default function DiagnosePage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<string>("Initializing...");

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    const runDiagnostics = async () => {
      addLog("🚀 Starting diagnostics...");

      // Check 1: Environment variables
      addLog(`📋 API URL from env: ${process.env.NEXT_PUBLIC_API_URL || 'Not set (using default)'}`);
      addLog(`📋 Current location: ${typeof window !== 'undefined' ? window.location.href : 'SSR'}`);

      // Check 2: Network connectivity
      addLog("🌐 Testing network connectivity...");

      try {
        // Test health endpoint
        addLog("  → Testing: http://localhost:8003/health");
        const healthStart = Date.now();
        const healthRes = await fetch("http://localhost:8003/health", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const healthTime = Date.now() - healthStart;
        addLog(`  ✅ Health endpoint: ${healthRes.status} (${healthTime}ms)`);

        if (healthRes.ok) {
          const healthData = await healthRes.json();
          addLog(`  📊 Health data: ${JSON.stringify(healthData)}`);
        }
      } catch (err: any) {
        addLog(`  ❌ Health endpoint failed: ${err.message}`);
      }

      try {
        // Test reports endpoint
        addLog("  → Testing: http://localhost:8003/api/v1/reports?viewer=alice");
        const reportsStart = Date.now();
        const reportsRes = await fetch("http://localhost:8003/api/v1/reports?viewer=alice", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const reportsTime = Date.now() - reportsStart;
        addLog(`  ✅ Reports endpoint: ${reportsRes.status} (${reportsTime}ms)`);

        if (reportsRes.ok) {
          const reportsData = await reportsRes.json();
          addLog(`  📊 Reports count: ${reportsData.length}`);
        } else {
          addLog(`  ⚠️  Reports error: ${reportsRes.statusText}`);
        }
      } catch (err: any) {
        addLog(`  ❌ Reports endpoint failed: ${err.message}`);
        setStatus("❌ Network Error");
        return;
      }

      // Check 3: Axios functionality
      addLog("📦 Testing axios library...");
      try {
        const axios = (await import('axios')).default;
        addLog("  ✅ Axios imported successfully");

        const api = axios.create({
          baseURL: "http://localhost:8003/api/v1",
          timeout: 5000,
        });

        addLog("  → Testing axios GET request...");
        const response = await api.get("/reports?viewer=alice");
        addLog(`  ✅ Axios request successful: ${response.data.length} reports`);
        setStatus("✅ All Tests Passed!");
      } catch (err: any) {
        addLog(`  ❌ Axios test failed: ${err.message}`);
        if (err.response) {
          addLog(`     Response status: ${err.response.status}`);
          addLog(`     Response data: ${JSON.stringify(err.response.data)}`);
        } else if (err.request) {
          addLog(`     No response received (request sent but no answer)`);
        } else {
          addLog(`     Error: ${err.message}`);
        }
        setStatus("⚠️ Partial Failure");
      }
    };

    runDiagnostics();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">🔍 Network Diagnostics</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <h2 className="text-xl font-semibold mb-2">Status</h2>
          <p className="text-lg font-bold">{status}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Diagnostic Logs</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ️ How to Check Browser Console</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Mac (Chrome/Edge)</strong>: Press Cmd + Option + I</li>
            <li>• <strong>Mac (Firefox)</strong>: Press Cmd + Option + K</li>
            <li>• <strong>Mac (Safari)</strong>: Press Cmd + Option + C (enable Develop menu first)</li>
            <li>• Or right-click anywhere on the page and select "Inspect" or "Inspect Element"</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
