import { Request, Response } from "express";
import crypto from "crypto";
import Project from "../models/Project";

// Register Project
export const registerProject = async (req: Request, res: Response): Promise<void> => {
  const { ownerEmail, websiteName, domain } = req.body;

  if (!domain) {
    res.status(400).json({ error: "Domain is required" });
    return;
  }

  const cleanDomain = domain
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "")
    .toLowerCase();

  try {
    const existing = await Project.findOne({ domain: cleanDomain });

    if (existing) {
      res.status(400).json({ error: "Domain already registered" });
      return;
    }

    const project = await Project.create({
      ownerEmail,
      websiteName,
      domain: cleanDomain,
      apiKey: "tl_live_" + crypto.randomBytes(16).toString("hex"),
      projectId: "proj_" + crypto.randomBytes(8).toString("hex"),
    });

    res.json({
      message: "Project created ✅",
      apiKey: project.apiKey,
      projectId: project.projectId,
      websiteName: project.websiteName,
      domain: project.domain,
    });

  } catch (err) {
    console.error("Project register error:", err);
    res.status(500).json({ error: "Failed to create project" });
  }
};


// Get Projects by Email
export const getProjectsByEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const projects = await Project.find({ ownerEmail: req.params.email });
    res.json(projects);
  } catch (err) {
    console.error("Fetch projects error:", err);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
};