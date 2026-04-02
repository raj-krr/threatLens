import axios from "axios";
import { Request, Response, NextFunction } from "express";

interface ThreatLensConfig {
  apiKey:    string;
  projectId: string;
  serverUrl?: string; // defaults to deployed server
}

interface AnalyzeResponse {
  status:      "allowed" | "flagged" | "blocked";
  threatScore: number;
}

function threatLens(config: ThreatLensConfig) {
  if (!config.apiKey)    throw new Error("ThreatLens: apiKey is required");
  if (!config.projectId) throw new Error("ThreatLens: projectId is required");

const SERVER_URL = config.serverUrl ?? "https://portfolioraj.in";

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const response = await axios.post<AnalyzeResponse>(
        `${SERVER_URL}/api/analyze`,
        {
          apiKey:    config.apiKey,
          projectId: config.projectId,
          ip:        req.ip,
          endpoint:  req.path,
          method:    req.method,
          userAgent: req.headers["user-agent"],
          body:      JSON.stringify(req.body),
        },
        { timeout: 2000 }
      );

      if (response.data.status === "blocked") {
        res.status(403).json({
          error:   "Access Denied",
          message: "Blocked by ThreatLens Security",
        });
        return;
      }

      // Attach score to request for logging
      (req as any).threatScore = response.data.threatScore;
      next();

    } catch {
      // NEVER crash the protected app
      next();
    }
  };
}

export default threatLens;