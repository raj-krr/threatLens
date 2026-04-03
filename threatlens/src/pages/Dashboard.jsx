import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { DashboardAPI } from "../api/dashboard";
import { socket } from "../socket";

import Globe from "../components/Globe";
import ThreatChart from "../components/ThreatChart";
import AlertPopup from "../components/AlertPopup";

export default function Dashboard() {
  const projectId = localStorage.getItem("projectId");

  const [stats, setStats] = useState({});
  const [logs, setLogs] = useState([]);
  const [liveLogs, setLiveLogs] = useState([]);
  const [alert, setAlert] = useState(null);

  // 🔥 LOAD INITIAL DATA
  useEffect(() => {
    if (!projectId) {
      console.log("❌ No projectId found");
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const statsRes = await DashboardAPI.getStats(projectId);
      const logsRes = await DashboardAPI.getAllLogs(projectId);

      console.log("📊 STATS:", statsRes.data);
      console.log("📋 LOGS:", logsRes.data);

      setStats(statsRes.data || {});
      setLogs(
        logsRes.data.logs ||
        logsRes.data.data ||
        logsRes.data ||
        []
      );
    } catch (err) {
      console.log("❌ API ERROR:", err);
    }
  };

  // 🔥 SOCKET (MATCHES BACKEND EXACTLY)
  useEffect(() => {
    if (!projectId) return;

    console.log("🔌 Connecting socket...");

    socket.connect();

    // ✅ CONNECT
    socket.on("connect", () => {
      console.log("✅ SOCKET CONNECTED:", socket.id);

      // 🔥 MUST MATCH BACKEND
      socket.emit("join_project", { projectId });
      console.log("📡 Joined project room:", projectId);
    });

    // ❌ ERROR
    socket.on("connect_error", (err) => {
      console.log("❌ SOCKET ERROR:", err.message);
    });

    // ⚠️ DISCONNECT
    socket.on("disconnect", () => {
      console.log("⚠️ SOCKET DISCONNECTED");
    });

    // 📡 REAL-TIME DATA (MATCH BACKEND EVENT)
    socket.on("new_request", (data) => {
      console.log("📡 RECEIVED:", data);

      // normalize (backend uses `score` not `threatScore`)
      const formatted = {
        ip: data.ip,
        attackType: data.attackType,
        status: data.status,
        threatScore: data.score,
        timestamp: data.timestamp,
      };

      setLogs((prev) => [formatted, ...prev]);
      setLiveLogs((prev) => [formatted, ...prev]);

      setAlert(formatted);
      setTimeout(() => setAlert(null), 2000);
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
      socket.off("new_request");
    };
  }, [projectId]);

  // 🔥 FILTER FUNCTION
  const handleFilter = async (type) => {
    try {
      let res;

      if (type === "blocked")
        res = await DashboardAPI.getBlockedLogs(projectId);

      else if (type === "flagged")
        res = await DashboardAPI.getFlaggedLogs(projectId);

      else if (type === "sql")
        res = await DashboardAPI.getByAttackType(
          projectId,
          "SQL_INJECTION"
        );

      else if (type === "limit")
        res = await DashboardAPI.getWithLimit(projectId, 10);

      else if (type === "combined")
        res = await DashboardAPI.getCombined(projectId);

      else res = await DashboardAPI.getAllLogs(projectId);

      console.log("🔍 FILTERED:", res.data);

      setLogs(
        res.data.logs ||
        res.data.data ||
        res.data ||
        []
      );

    } catch (err) {
      console.log("❌ FILTER ERROR:", err);
    }
  };

  return (
    <Layout>
      <AlertPopup attack={alert} />

      <div className="p-6 space-y-6 text-white">

        {/* 🔘 FILTER BUTTONS */}
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => handleFilter("all")}>All</button>
          <button onClick={() => handleFilter("blocked")}>Blocked</button>
          <button onClick={() => handleFilter("flagged")}>Flagged</button>
          <button onClick={() => handleFilter("sql")}>SQL</button>
          <button onClick={() => handleFilter("limit")}>Top 10</button>
          <button onClick={() => handleFilter("combined")}>Combined</button>
        </div>

        {/* 🌍 + 📊 */}
        <div className="grid grid-cols-2 gap-6">

          <div className="card glow h-[400px]">
            <Globe logs={liveLogs} />
          </div>

          <div className="card glow h-[400px]">
            <ThreatChart stats={stats} />
          </div>

        </div>

        {/* 📋 LOG TABLE */}
        <div className="card glow overflow-x-auto">

          {logs.length === 0 ? (
            <p>No logs found</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-cyan-400">
                  <th>IP</th>
                  <th>Attack</th>
                  <th>Status</th>
                  <th>Score</th>
                </tr>
              </thead>

              <tbody>
                {Array.isArray(logs) &&
                  logs.map((log, i) => (
                    <tr key={i} className="text-center border-t">
                      <td>{log.ip}</td>
                      <td>{log.attackType}</td>
                      <td className="text-red-400">{log.status}</td>
                      <td>{log.threatScore}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

        </div>

      </div>
    </Layout>
  );
}