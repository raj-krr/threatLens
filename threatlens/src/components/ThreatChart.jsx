import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ThreatChart({ stats }) {
  const data = [
    { time: "Now", value: stats.total || 10 },
    { time: "+1m", value: (stats.total || 10) + 5 },
    { time: "+2m", value: (stats.total || 10) + 10 },
    { time: "+3m", value: (stats.total || 10) + 15 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />

        <Line
          type="monotone"
          dataKey="value"
          stroke="#06b6d4"
          strokeWidth={3}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}