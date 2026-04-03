import { Link, useLocation } from "react-router-dom";

export default function Layout({ children }) {
  const location = useLocation();

  const linkStyle = (path) =>
    `block p-2 rounded ${
      location.pathname === path
        ? "bg-cyan-500 text-black"
        : "text-gray-400 hover:bg-cyan-500 hover:text-black"
    }`;

  return (
    <div className="flex min-h-screen bg-black text-white">

      {/* Sidebar */}
      <div className="w-64 bg-slate-900 p-4 border-r border-cyan-500">

        <h2 className="text-xl text-cyan-400 mb-6">
          ⚡ ThreatLens
        </h2>

        <nav className="space-y-2">
          <Link to="/dashboard" className={linkStyle("/dashboard")}>
            Dashboard
          </Link>

          <Link to="/logs" className={linkStyle("/logs")}>
            Logs
          </Link>

          <Link to="/suggestions" className={linkStyle("/suggestions")}>
            Suggestions
          </Link>

          <Link to="/admin" className={linkStyle("/admin")}>
            Admin
          </Link>
        </nav>

        <button
          className="mt-10 w-full bg-red-500 py-2 rounded hover:bg-red-400"
          onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}
        >
          Logout
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {children}
      </div>
    </div>
  );
}