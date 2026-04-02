import express from "express";
import { getSuggestions } from "../controllers/suggestionsController";

const router = express.Router();

router.get("/:projectId", getSuggestions);

export default router;