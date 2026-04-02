import { Request, Response, NextFunction } from "express";
import { Server } from "socket.io";
import RequestModel, { IRequest } from "../models/Request";
import BlockedIP from "../models/BlockedIP";
import { calculate } from "../services/scoringEngine";
import { analyzeWithML } from "../services/mlDetector";

export default (io: Server) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const ip = req.ip ?? req.socket.remoteAddress ?? "unknown";
    const projectId = (req.headers["x-project-id"] as string) ?? "demo";

    try {
      // Check if IP is already blocked
      const isBlocked = await BlockedIP.findOne({ ip, projectId });
      if (isBlocked) {
        res.status(403).json({ error: "IP Blocked by ThreatLens" });
        return;
      }

      // Get recent history for this IP
      const history = await RequestModel.find({ ip, projectId })
        .sort({ timestamp: -1 })
        .limit(100);

      // Rule based scoring
      const ruleResult = calculate(ip, {
        body:      JSON.stringify(req.body),
        url:       req.url,
        endpoint:  req.path,
        userAgent: req.headers["user-agent"] ?? "",
      }, history as IRequest[]);

      // Build ML input
      const now = Date.now();
      const uniqueEndpoints = [...new Set(history.map(r => r.endpoint))].length;
      const times = history
        .slice(0, 5)
        .map(r => new Date(r.timestamp).getTime());
      const diffs = times
        .slice(1)
        .map((t, i) => Math.abs(t - (times[i] ?? 0)));
      const avgTime = diffs.length
        ? diffs.reduce((a, b) => a + b, 0) / diffs.length
        : 3000;
      const errors = history.filter(r => r.status === "blocked").length;

      // ML scoring
      const mlResult = await analyzeWithML({
        requestsPerMin:  history.filter(r =>
          new Date(r.timestamp).getTime() > now - 60000).length,
        uniqueEndpoints,
        avgTimeBetween:  avgTime,
        loginAttempts:   history.filter(r => r.endpoint === "/login").length,
        errorRate:       history.length ? errors / history.length : 0,
      });

      // Combine rule + ML scores
      let finalScore = ruleResult.score;
      if (mlResult.is_anomaly) finalScore = Math.min(finalScore + 30, 100);

      const finalStatus: "allowed" | "flagged" | "blocked" =
        finalScore > 60 ? "blocked" :
        finalScore > 30 ? "flagged" :
        "allowed";

      // Save to MongoDB
      await RequestModel.create({
        projectId,
        ip,
        endpoint:    req.path,
        method:      req.method,
        userAgent:   req.headers["user-agent"],
        body:        JSON.stringify(req.body).substring(0, 500),
        threatScore: finalScore,
        status:      finalStatus,
        attackType:  ruleResult.attackType,
        timestamp:   new Date(),
      });

      // Auto block if score is critical
      if (finalScore > 80) {
        await BlockedIP.create({
          projectId,
          ip,
          reason:    ruleResult.attackType,
          blockedAt: new Date(),
          expiresAt: new Date(Date.now() + 3600000), // 1 hour
        });
      }

      // Emit to dashboard in real time
      io.to(projectId).emit("new_request", {
        ip,
        endpoint:   req.path,
        score:      finalScore,
        status:     finalStatus,
        attackType: ruleResult.attackType,
        mlAnomaly:  mlResult.is_anomaly,
        timestamp:  new Date(),
      });

      // Block the request if needed
      if (finalStatus === "blocked") {
        res.status(403).json({
          error:   "Access Denied",
          message: "ThreatLens has blocked this request",
        });
        return;
      }

      next();

    } catch (err) {
      console.error("ThreatLens middleware error:", err);
      next(); // never break the app
    }
  };