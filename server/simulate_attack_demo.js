const axios = require("axios");

const BASE = "https://aws-cloud-club-backend-me1e.onrender.com";
const DASHBOARD = "https://portfolioraj.in/api/dashboard/logs/proj_b1b5de2e818ccc70";

async function normalTraffic() {
  console.log("🟢 Simulating normal traffic...");
  for (let i = 0; i < 5; i++) {
    await axios.get(`${BASE}/`).catch(() => {});
    await new Promise(r => setTimeout(r, 500));
  }
  console.log("✅ Normal traffic done");
}

async function sqlInjection() {
  console.log("🔴 Simulating SQL Injection...");
  await axios.get(`${BASE}/api/users?id=1' OR '1'='1`).catch(() => {});
  await axios.post(`${BASE}/api/users/login`, {
    username: "admin'--",
    password: "anything"
  }).catch(() => {});
  console.log("✅ SQL Injection done");
}

async function bruteForce() {
  console.log("🔴 Simulating Brute Force...");
  const promises = Array.from({ length: 20 }, (_, i) =>
    axios.post(`${BASE}/api/users/login`, {
      username: "admin",
      password: `password${i}`
    }).catch(() => {})
  );
  await Promise.all(promises);
  console.log("✅ Brute Force done");
}

async function ddos() {
  console.log("🔴 Simulating DDoS...");
  const promises = Array.from({ length: 50 }, () =>
    axios.get(`${BASE}/`).catch(() => {})
  );
  await Promise.all(promises);
  console.log("✅ DDoS done");
}

async function botTraffic() {
  console.log("🔴 Simulating Bot Traffic...");
  const promises = Array.from({ length: 10 }, () =>
    axios.get(`${BASE}/`, {
      headers: { "User-Agent": "python-requests/2.28.0" }
    }).catch(() => {})
  );
  await Promise.all(promises);
  console.log("✅ Bot Traffic done");
}

async function xss() {
  console.log("🔴 Simulating XSS Attack...");
  await axios.get(`${BASE}/?q=<script>alert('xss')</script>`).catch(() => {});
  await axios.post(`${BASE}/api/users`, {
    name: "<script>alert('xss')</script>"
  }).catch(() => {});
  console.log("✅ XSS done");
}

async function checkDashboard() {
  console.log("\n📊 Fetching ThreatLens logs...");
  const res = await axios.get(DASHBOARD);
  const logs = res.data.logs.slice(0, 5);
  console.log(`Total logged: ${res.data.total}`);
  logs.forEach(l => {
    const icon = l.status === "blocked" ? "🔴" : l.status === "flagged" ? "🟡" : "🟢";
    console.log(`${icon} ${l.attackType} | score: ${l.threatScore} | ${l.ip} | ${l.endpoint}`);
  });
}

// DEMO FLOW
(async () => {
  console.log("🎯 ThreatLens Live Demo Starting...\n");
  console.log("Target:", BASE);
  console.log("Dashboard:", DASHBOARD);
  console.log("─────────────────────────────\n");

  await normalTraffic();
  await new Promise(r => setTimeout(r, 1000));

  await sqlInjection();
  await new Promise(r => setTimeout(r, 1000));

  await bruteForce();
  await new Promise(r => setTimeout(r, 1000));

  await ddos();
  await new Promise(r => setTimeout(r, 1000));

  await botTraffic();
  await new Promise(r => setTimeout(r, 1000));

  await xss();
  await new Promise(r => setTimeout(r, 2000));

  await checkDashboard();

  console.log("\n✅ Demo complete! Show judges the dashboard now 🎯");
})();