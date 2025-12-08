"use client";

import { useEffect, useState } from "react";

type ApiEndpoint = {
  path: string;
  methods: string[];
  file: string;
};

type EndpointResponse = {
  success: boolean;
  data?: ApiEndpoint[];
  message?: string;
  error?: string;
};

export default function EndpointListPage() {
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/endpoints");
        const json: EndpointResponse = await res.json();
        if (!json.success || !json.data) {
          throw new Error(json.message || json.error || "Failed to load endpoints");
        }
        setEndpoints(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <main className="min-h-screen bg-white text-black px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold">API Endpoint List</h1>
          <p className="text-gray-600">
            Generated automatically from <code className="font-mono">app/api</code>. Segments
            like <code className="font-mono">[id]</code> represent dynamic params.
          </p>
        </header>

        {loading && <p className="text-gray-700">Loading endpoints…</p>}
        {error && <p className="text-red-600">Error: {error}</p>}

        {!loading && !error && (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Path
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Methods
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    File
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {endpoints.map((ep) => (
                  <tr key={`${ep.path}-${ep.file}`}>
                    <td className="px-4 py-3 font-mono text-sm text-gray-900">{ep.path}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="flex flex-wrap gap-2">
                        {ep.methods.map((m) => (
                          <span
                            key={m}
                            className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-800"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{ep.file}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
