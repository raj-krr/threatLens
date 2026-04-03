import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { DashboardAPI } from "../api/dashboard";

export default function Logs() {
  const projectId = localStorage.getItem("projectId");

  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchLogs();
  }, [projectId]);

  const fetchLogs = async () => {
    try {
      const res = await DashboardAPI.getAllLogs(projectId);

      console.log("📋 LOGS DATA:", res.data);

      setLogs(res.data.logs || []);
    } catch (err) {
      console.error("❌ Error fetching logs:", err);
    }
  };

  return (
    <Layout>
      <div className="p-6 text-white">

        {/* 🔥 TITLE */}
        <h1 className="text-2xl font-bold mb-4 text-cyan-400">
          Logs
        </h1>

        {/* 🔥 TABLE */}
        <div className="bg-[#0f172a] border border-cyan-500 rounded-lg shadow-lg overflow-x-auto">

          <table className="w-full text-sm text-left">

            {/* HEADER */}
            <thead className="bg-[#020617] text-cyan-400 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">IP</th>
                <th className="px-4 py-3">Endpoint</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {logs.length > 0 ? (
                logs.map((log, i) => (
                  <tr
                    key={i}
                    className="border-t border-gray-700 hover:bg-[#020617] transition"
                  >
                    {/* IP */}
                    <td className="px-4 py-2">{log.ip}</td>

                    {/* ENDPOINT */}
                    <td className="px-4 py-2">{log.endpoint}</td>

                    {/* SCORE */}
                    <td className="px-4 py-2">
                      {log.threatScore || log.score}
                    </td>

                    {/* STATUS */}
                    <td
                      className={`px-4 py-2 font-semibold ${
                        log.status === "blocked"
                          ? "text-red-500"
                          : log.status === "flagged"
                          ? "text-yellow-400"
                          : "text-green-400"
                      }`}
                    >
                      {log.status}
                    </td>

                    {/* ACTION */}
                    <td className="px-4 py-2">
                      {log.status === "blocked" ? (
                        <button className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded">
                          Unblock
                        </button>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-400">
                    No logs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 🔥 PAGINATION */}
        <div className="flex items-center gap-4 mt-4">

          <button
            className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </button>

          <span className="text-sm">Page {page}</span>

          <button
            className="px-4 py-2 bg-gray-700 rounded"
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>

        </div>

      </div>
    </Layout>
  );
}