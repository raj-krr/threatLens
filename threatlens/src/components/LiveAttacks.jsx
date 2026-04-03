import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://portfolioraj.in");

export default function LiveAttacks({ setGlobeAttacks }) {
  const [attacks, setAttacks] = useState([]);

  useEffect(() => {
    socket.on("new_attack", (data) => {
      console.log("🔥 Attack:", data);

      setAttacks((prev) => [data, ...prev.slice(0, 9)]);

      // Send to globe
      setGlobeAttacks((prev) => [...prev.slice(-5), data]);
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div className="bg-black border border-red-500 p-4 mt-6 rounded">
      <h2 className="text-red-400 mb-2">⚡ Live Attacks</h2>

      {attacks.length === 0 && (
        <p className="text-gray-500">No attacks yet</p>
      )}

      {attacks.map((a, i) => (
        <div key={i} className="text-red-300 text-sm">
          {a.ip} → {a.endpoint}
        </div>
      ))}
    </div>
  );
}