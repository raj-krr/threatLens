import { Request, Response } from "express";
import RequestModel from "../models/Request";
import BlockedIP from "../models/BlockedIP";

//Get Stats
export const getProjectStats = async (req: Request, res: Response): Promise<void> => {
  const { projectId } = req.params;

  try {
    const oneDayAgo = new Date(Date.now() - 86400000);

    const [total, blocked, flagged, attackTypes, recentThreats, blockedIPs] =
      await Promise.all([
        RequestModel.countDocuments({ projectId, timestamp: { $gte: oneDayAgo } }),
        RequestModel.countDocuments({ projectId, status: "blocked", timestamp: { $gte: oneDayAgo } }),
        RequestModel.countDocuments({ projectId, status: "flagged", timestamp: { $gte: oneDayAgo } }),
        RequestModel.aggregate([
          { $match: { projectId, attackType: { $ne: "normal" } } },
          { $group: { _id: "$attackType", count: { $sum: 1 } } }
        ]),
        RequestModel.find({ projectId, status: { $in: ["blocked", "flagged"] } })
          .sort({ timestamp: -1 })
          .limit(20),
        BlockedIP.find({ projectId })
          .sort({ blockedAt: -1 })
          .limit(10),
      ]);

    res.json({ total, blocked, flagged, attackTypes, recentThreats, blockedIPs });

  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


//Get Logs with Filters
export const getProjectLogs = async (req: Request, res: Response): Promise<void> => {
  const { projectId } = req.params;
  const limit = parseInt(req.query.limit as string) || 50;
  const status = req.query.status as string | undefined;
  const attackType = req.query.attackType as string | undefined;

  try {
    const filter: Record<string, unknown> = { projectId };

    if (status)     filter.status     = status;
    if (attackType) filter.attackType = attackType;

    const logs = await RequestModel.find(filter)
      .sort({ timestamp: -1 })
      .limit(limit);

    res.json({
      projectId,
      total: logs.length,
      logs,
    });

  } catch (err) {
    console.error("Logs fetch error:", err);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
};


//Unblock IP
export const unblockIP = async (req: Request, res: Response): Promise<void> => {
  const { projectId, ip } = req.params;

  try {
    await BlockedIP.deleteOne({ projectId, ip });
    res.json({ message: `IP ${ip} unblocked successfully` });
  } catch (err) {
    console.error("Unblock IP error:", err);
    res.status(500).json({ error: "Failed to unblock IP" });
  }
};

export const mlMetrics = async (req: Request, res: Response): Promise<void> => {
  try {
    const fs = await import("fs");
    const path = await import("path");
    const metricsPath = path.join(process.cwd(), "..", "ml_detector", "model_metrics.json");
    const metrics = JSON.parse(fs.readFileSync(metricsPath, "utf-8"));
    res.json(metrics);
  } catch (err) {
    res.status(500).json({ error: "Metrics not found" });
  }
};
