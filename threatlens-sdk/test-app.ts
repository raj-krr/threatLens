import express from "express";
import threatLens from "./index";

const app = express();
app.use(express.json());

// Add ThreatLens in 2 lines — this is what users do
app.use(threatLens({
  apiKey:    "tl_live_6832f574cea488b5d3e11b932f058375",  // paste your key from Postman
  projectId: "proj_9d5117d62cb0b754",      // paste your projectId
  serverUrl: "http://localhost:5000",
}));

app.get("/", (req, res) => {
  res.json({ message: "Protected by ThreatLens! 🛡️" });
});

app.post("/login", (req, res) => {
  res.json({ message: "Login endpoint" });
});

app.listen(4000, () => {
  console.log("Test app running on port 4000 ✅");
  console.log("Protected by ThreatLens 🛡️");
});