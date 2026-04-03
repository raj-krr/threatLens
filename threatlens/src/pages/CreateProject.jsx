import { useState } from "react";
import { API } from "../api";
import { useNavigate } from "react-router-dom";

export default function CreateProject() {
  const [form, setForm] = useState({
    ownerEmail: "",
    websiteName: "",
    domain: "",
  });

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!form.ownerEmail || !form.websiteName || !form.domain) {
      alert("Please fill all fields ❌");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/api/projects/register", form);

      console.log("Created:", res.data);

      // ✅ Save projectId
      localStorage.setItem("projectId", res.data.projectId);

      alert("Project Created 🚀");

      // 👉 Redirect to dashboard
      navigate("/dashboard");

    } catch (err) {
      console.error(err);
      alert("Error creating project ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">

      <div className="w-96 bg-slate-900 border border-cyan-500 rounded-lg p-6 shadow-lg shadow-cyan-500">

        <h1 className="text-xl font-bold text-cyan-400 mb-4 text-center">
          ➕ Create Project
        </h1>

        {/* Email */}
        <input
          type="email"
          placeholder="Owner Email"
          className="w-full p-2 mb-3 bg-black border border-cyan-500 text-white rounded"
          value={form.ownerEmail}
          onChange={(e) =>
            setForm({ ...form, ownerEmail: e.target.value })
          }
        />

        {/* Website */}
        <input
          type="text"
          placeholder="Website Name"
          className="w-full p-2 mb-3 bg-black border border-cyan-500 text-white rounded"
          value={form.websiteName}
          onChange={(e) =>
            setForm({ ...form, websiteName: e.target.value })
          }
        />

        {/* Domain */}
        <input
          type="text"
          placeholder="Domain"
          className="w-full p-2 mb-3 bg-black border border-cyan-500 text-white rounded"
          value={form.domain}
          onChange={(e) =>
            setForm({ ...form, domain: e.target.value })
          }
        />

        {/* Button */}
        <button
          className="w-full bg-cyan-500 text-black py-2 rounded hover:bg-cyan-400 transition"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Project 🚀"}
        </button>

      </div>
    </div>
  );
}