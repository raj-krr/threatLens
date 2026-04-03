export default function AlertPopup({ attack }) {
  if (!attack) return null;

  return (
    <div className="fixed top-5 right-5 z-50 bg-red-600 text-white px-4 py-3 rounded shadow-lg animate-pulse">
      ⚠️ Threat Detected
      <div className="text-sm mt-1">
        {attack.ip} → {attack.attackType}
      </div>
    </div>
  );
}