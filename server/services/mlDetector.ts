import { spawn } from "child_process";
import path from "path";

interface MLInput {
  requestsPerMin: number;
  uniqueEndpoints: number;
  avgTimeBetween: number;
  loginAttempts: number;
  errorRate: number;
}

interface MLResult {
  is_anomaly: boolean;
  confidence: number;
  label: string;
  attack_type: string;
}

export function analyzeWithML(ipStats: MLInput): Promise<MLResult> {
  return new Promise((resolve) => {
    const input = JSON.stringify({
      requests_per_min:          ipStats.requestsPerMin,
      unique_endpoints:          ipStats.uniqueEndpoints,
      avg_time_between_requests: ipStats.avgTimeBetween,
      login_attempts:            ipStats.loginAttempts,
      error_rate:                ipStats.errorRate,
    });
const scriptPath = path.join(__dirname, "../../ml_detector/predict.py");

    const python = spawn("python3", [scriptPath, input]);
    let result = "";

    python.stdout.on("data", (data: Buffer) => {
      result += data.toString();
    });

    python.stderr.on("data", (err: Buffer) => {
      console.error("ML Error:", err.toString());
    });

    python.on("close", () => {
      try {
        resolve(JSON.parse(result));
      } catch {
        // fail safe — never crash the app
        resolve({ is_anomaly: false, confidence: 0, label: "NORMAL", attack_type:"normal" });
      }
    });
  });
}