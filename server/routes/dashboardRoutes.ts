import express from "express";
import {
  getProjectStats,
  getProjectLogs,
  unblockIP,
  mlMetrics
} from "../controllers/dashboardController";

const router = express.Router();

router.get("/stats/:projectId", getProjectStats);
router.get("/logs/:projectId", getProjectLogs);
router.delete("/unblock/:projectId/:ip", unblockIP);
router.get("/ml-metrics/:projectId", mlMetrics);

export default router;