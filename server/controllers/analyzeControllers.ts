import { Request, Response } from "express";
import { Server } from "socket.io";
import Project from "../models/Project";
import RequestModel from "../models/Request";
import BlockedIP from "../models/BlockedIP";
import { calculate } from "../services/scoringEngine";

export const analyzeRequest = (io: Server) => {
  return async (req: Request, res: Response): Promise<void> => {
    const { apiKey, projectId, ip, endpoint, method, userAgent, body } = req.body;

    const requestOrigin = (req.headers["origin"] ?? req.headers["referer"] ?? "") as string;

    try {
      //Verify project
      const project = await Project.findOne({ apiKey, projectId });
      if (!project) {
        res.status(401).json({ error: "Invalid API credentials" });
        return;
      }

      //Domain check
      if (requestOrigin && !requestOrigin.includes(project.domain)) {
        res.status(403).json({ error: "Domain mismatch — request not from registered domain" });
        return;
      }

      //Check blocked IP
      const isBlocked = await BlockedIP.findOne({ ip, projectId });
      if (isBlocked) {
        res.status(403).json({ error: "IP Blocked by ThreatLens" });
        return;
      }

      // Get history
      const history = await RequestModel.find({ ip, projectId })
        .sort({ timestamp: -1 })
        .limit(100);

      // Score
      const ruleResult = calculate(ip, { body, url: endpoint, endpoint, userAgent }, history);

      const finalStatus: "allowed" | "flagged" | "blocked" =
        ruleResult.score > 60 ? "blocked" :
        ruleResult.score > 30 ? "flagged" :
        "allowed";

      await RequestModel.create({
        projectId,
        ip,
        endpoint,
        method,
        userAgent,
        body: body?.substring(0, 500),
        threatScore: ruleResult.score,
        status: finalStatus,
        attackType: ruleResult.attackType,
        timestamp: new Date(),
      });

      //Auto block
      if (ruleResult.score > 80) {
        await BlockedIP.create({
          projectId,
          ip,
          reason: ruleResult.attackType,
          blockedAt: new Date(),
          expiresAt: new Date(Date.now() + 3600000),
        });
      }

      //  Emit socket
      io.to(projectId).emit("new_request", {
        ip,
        endpoint,
        score: ruleResult.score,
        status: finalStatus,
        attackType: ruleResult.attackType,
        timestamp: new Date(),
      });

      res.json({ status: finalStatus, threatScore: ruleResult.score });

    } catch (err) {
      console.error("Analyze controller error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  };
};