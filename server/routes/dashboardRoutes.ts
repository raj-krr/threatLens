import express from "express";
import {
  getProjectStats,
  getProjectLogs,
  unblockIP
} from "../controllers/dashboardController";

const router = express.Router();

router.get("/stats/:projectId", getProjectStats);
router.get("/logs/:projectId", getProjectLogs);
router.delete("/unblock/:projectId/:ip", unblockIP);

export default router;