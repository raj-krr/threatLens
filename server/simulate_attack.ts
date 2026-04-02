import axios from "axios";

const BASE = "http://localhost:5000/demo";

async function bruteForce() {
  console.log("🔴 Simulating Brute Force...");
  const promises = Array.from({ length: 50 }, (_, i) =>
    axios.post(`${BASE}/login`, {
      username: "admin",
      password: `pass${i}`,
    }).catch(() => {})
  );
  await Promise.all(promises);
}

async function sqlInjection() {
  console.log("🔴 Simulating SQL Injection...");
  await Promise.all([
    axios.get(`${BASE}/users?id=1' OR '1'='1`).catch(() => {}),
    axios.post(`${BASE}/login`, {
      username: "admin'--",
      password: "anything",
    }).catch(() => {}),
  ]);
}

async function ddosAttack() {
  console.log("🔴 Simulating DDoS...");
  const hits = Array.from({ length: 100 }, () =>
    axios.get(`${BASE}/api/data`).catch(() => {})
  );
  await Promise.all(hits);
}

async function botTraffic() {
  console.log("🔴 Simulating Bot Traffic...");
  const promises = Array.from({ length: 20 }, () =>
    axios.get(`${BASE}/products`, {
      headers: { "User-Agent": "python-requests/2.28.0" },
    }).catch(() => {})
  );
  await Promise.all(promises);
}

async function xssAttack() {
  console.log("🔴 Simulating XSS Attack...");
  await Promise.all([
    axios.post(`${BASE}/comment`, {
      text: "<script>alert('xss')</script>",
    }).catch(() => {}),
    axios.get(`${BASE}/search?q=<script>alert(1)</script>`).catch(() => {}),
  ]);
}

// Fire all attacks
(async () => {
  console.log("🎯 ThreatLens Attack Simulator Starting...\n");

  await bruteForce();
  await new Promise(r => setTimeout(r, 2000));

  await sqlInjection();
  await new Promise(r => setTimeout(r, 2000));

  await ddosAttack();
  await new Promise(r => setTimeout(r, 2000));

  await botTraffic();
  await new Promise(r => setTimeout(r, 2000));

  await xssAttack();

  console.log("\n✅ Attack simulation complete! Check your dashboard 🎯");
})();