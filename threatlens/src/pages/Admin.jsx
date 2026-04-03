import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { DashboardAPI } from "../api/dashboard";

export default function Admin() {
  const projectId = localStorage.getItem("projectId");

  const [blockedIPs, setBlockedIPs] = useState([]);

  useEffect(() => {
    fetchBlocked();
  }, []);

  const fetchBlocked = async () => {
    try {
      const res = await DashboardAPI.getBlockedLogs(projectId);

      console.log("🚫 BLOCKED:", res.data);

      setBlockedIPs(res.data.logs || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnblock = async (ip) => {
    try {
      await DashboardAPI.unblockIP(projectId, ip);

      alert(`✅ Unblocked ${ip}`);

      fetchBlocked();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <div className="p-6 text-white">

        
        <h1 className="text-2xl font-bold text-cyan-400 mb-4">
          Admin Panel 👑
        </h1>

        
        <div className="bg-[#0f172a] border border-cyan-500 rounded-lg shadow-lg overflow-x-auto">

          <table className="w-full text-sm">

            {/* HEADER */}
            <thead className="bg-[#020617] text-cyan-400 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">IP</th>
                <th className="px-4 py-3">Attack</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {blockedIPs.length > 0 ? (
                blockedIPs.map((log, i) => (
                  <tr
                    key={i}
                    className="border-t border-gray-700 hover:bg-[#020617]"
                  >
                    <td className="px-4 py-2">{log.ip}</td>

                    <td className="px-4 py-2">
                      {log.attackType || "-"}
                    </td>

                    <td className="px-4 py-2">
                      {log.threatScore || log.score}
                    </td>

                    <td className="px-4 py-2 text-red-500 font-semibold">
                      {log.status}
                    </td>

                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleUnblock(log.ip)}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
                      >
                        Unblock
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-6 text-gray-400"
                  >
                    No blocked IPs
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>
      </div>
    </Layout>
  );
}