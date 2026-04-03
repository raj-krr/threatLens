export default function CyberBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden z-0">

      {/* 🌐 GRID BACKGROUND */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* 🔷 GLOW BLOB 1 */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />

      {/* 🔵 GLOW BLOB 2 */}
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />

      {/* 🟣 EXTRA GLOW */}
      <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />

      {/* ⚡ MOVING SCAN LINE */}
      <div className="absolute inset-0">
        <div className="w-full h-[2px] bg-cyan-400 opacity-30 animate-scan" />
      </div>

      {/* 🧊 CUSTOM ANIMATION */}
      <style>
        {`
          @keyframes scan {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100vh); }
          }

          .animate-scan {
            animation: scan 6s linear infinite;
          }
        `}
      </style>

    </div>
  );
}