export const generateFakeAttack = () => {
  const ips = ["8.8.8.8", "1.1.1.1", "45.33.32.156", "103.21.244.0"];

  const types = ["SQL_INJECTION", "BRUTE_FORCE", "XSS"];

  return {
    ip: ips[Math.floor(Math.random() * ips.length)],
    attackType: types[Math.floor(Math.random() * types.length)],
    status: "blocked",
    timestamp: Date.now(),
  };
};