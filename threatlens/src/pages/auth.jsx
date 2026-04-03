import { useState } from "react";
import { API } from "../api";
import { useNavigate } from "react-router-dom";
import CyberBackground from "../components/CyberBackground";
import { motion } from "framer-motion";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // 🔥 Fetch projects
  const fetchProjects = async () => {
    if (!email) {
      alert("Enter email ❌");
      return;
    }

    try {
      setLoading(true);

      const res = await API.get(`/api/projects/${email}`);
      setProjects(res.data || []);

    } catch (err) {
      console.error(err);
      alert("Error fetching projects ❌");
    } finally {
      setLoading(false);
    }
  };

  // 🎯 Select project
  const selectProject = (p) => {
    localStorage.setItem("projectId", p.projectId);
    navigate("/dashboard");
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black">

      {/* 🌐 Background */}
      <CyberBackground />

      {/* 🔥 MAIN CARD */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-[420px] p-8 rounded-2xl backdrop-blur-lg bg-white/5 border border-cyan-400/30 shadow-[0_0_40px_rgba(0,255,255,0.2)]"
      >

        {/* ⚡ HEADER */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-cyan-400 flex items-center justify-center gap-2">
            ⚡ ThreatLens
          </h1>
          <p className="text-gray-400 mt-2">
            Cyber Defense Dashboard
          </p>
        </div>

        {/* ✉️ INPUT */}
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full p-3 rounded-lg bg-black/70 border border-cyan-500 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* 🔘 BUTTONS */}
        <div className="flex gap-3 mb-4">

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchProjects}
            className="flex-1 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-semibold shadow-lg hover:shadow-cyan-500"
          >
            {loading ? "Loading..." : "Get Projects"}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/create-project")}
            className="flex-1 py-2 rounded-lg bg-gradient-to-r from-green-400 to-emerald-500 text-black font-semibold shadow-lg hover:shadow-green-500"
          >
            Create
          </motion.button>

        </div>

        {/* 📦 PROJECT LIST */}
        <div className="max-h-40 overflow-y-auto space-y-2">

          {projects.length === 0 && !loading && (
            <p className="text-gray-500 text-center">
              No projects found
            </p>
          )}

          {projects.map((p) => (
            <div
              key={p.projectId}
              onClick={() => selectProject(p)}
              className="p-3 rounded-lg border border-cyan-500/40 bg-black/50 hover:bg-cyan-500 hover:text-black cursor-pointer transition"
            >
              <p className="font-semibold">{p.websiteName}</p>
              <p className="text-sm text-gray-400">
                {p.domain}
              </p>
            </div>
          ))}

        </div>

      </motion.div>
    </div>
  );
}