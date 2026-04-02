import express from "express";
import { registerProject, getProjectsByEmail } from "../controllers/projectController";

const router = express.Router();

router.post("/register", registerProject);
router.get("/:email", getProjectsByEmail);

export default router;