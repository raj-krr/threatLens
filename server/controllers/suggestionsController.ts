import { Request, Response } from "express";
import RequestModel from "../models/Request";

const SUGGESTIONS: Record<string, { title: string; steps: string[] }> = {
  BRUTE_FORCE: {
    title: "Brute Force Attack Detected",
    steps: [
      "Implement account lockout after 5 failed login attempts",
      "Add CAPTCHA to your login page",
      "Enable multi-factor authentication (MFA)",
      "Use rate limiting on /login endpoint",
      "Alert users of suspicious login attempts via email",
    ],
  },
  DDOS: {
    title: "DDoS Attack Detected",
    steps: [
      "Enable Cloudflare or AWS Shield for DDoS protection",
      "Set up rate limiting (max 60 requests/min per IP)",
      "Use a CDN to absorb traffic spikes",
      "Configure auto-scaling on your server",
      "Block suspicious IP ranges at firewall level",
    ],
  },
  SQL_INJECTION: {
    title: "SQL Injection Attack Detected",
    steps: [
      "Never build SQL queries with string concatenation",
      "Use parameterized queries or prepared statements",
      "Validate and sanitize ALL user inputs",
      "Use an ORM like Mongoose, Prisma, or Sequelize",
      "Limit database user permissions (least privilege)",
    ],
  },
  XSS_ATTACK: {
    title: "Cross-Site Scripting (XSS) Attack Detected",
    steps: [
      "Sanitize all user input before rendering to HTML",
      "Use Content Security Policy (CSP) headers",
      "Encode output data using libraries like DOMPurify",
      "Set HttpOnly and Secure flags on cookies",
      "Avoid using innerHTML — use textContent instead",
    ],
  },
  BOT_TRAFFIC: {
    title: "Malicious Bot Traffic Detected",
    steps: [
      "Add CAPTCHA challenges on forms and login pages",
      "Implement honeypot fields to trap bots",
      "Block suspicious User-Agent strings",
      "Use robots.txt to restrict bot access",
      "Monitor and block IPs with inhuman request speeds",
    ],
  },
  PATH_TRAVERSAL: {
    title: "Path Traversal Attack Detected",
    steps: [
      "Never use user input directly in file paths",
      "Validate and sanitize file path inputs",
      "Use allowlists for permitted file access",
      "Run your server with minimal file system permissions",
      "Use path.resolve() and verify it stays within allowed directory",
    ],
  },
  CMD_INJECTION: {
    title: "Command Injection Attack Detected",
    steps: [
      "Never pass user input to shell commands",
      "Use child_process with argument arrays, not strings",
      "Validate all inputs strictly with allowlists",
      "Avoid exec() — use execFile() or spawn() instead",
      "Run processes with least privilege permissions",
    ],
  },
  RATE_ABUSE: {
    title: "Rate Abuse Detected",
    steps: [
      "Implement IP-based rate limiting with express-rate-limit",
      "Add request throttling per user/session",
      "Return 429 Too Many Requests with Retry-After header",
      "Monitor and alert on traffic spikes",
      "Consider token bucket or sliding window algorithms",
    ],
  },
  normal: {
    title: "No Threats Detected",
    steps: [
      "Keep your dependencies updated regularly",
      "Enable HTTPS on all endpoints",
      "Review server logs periodically",
      "Set up automated security scanning in CI/CD",
      "Keep ThreatLens monitoring active 24/7",
    ],
  },
};

export const getSuggestions = async (req: Request, res: Response): Promise<void> => {
  const { projectId } = req.params;

  try {
    const oneDayAgo = new Date(Date.now() - 86400000);

    const recentAttacks = await RequestModel.aggregate([
      {
        $match: {
          projectId,
          attackType: { $ne: "normal" },
          timestamp: { $gte: oneDayAgo },
        },
      },
      {
        $group: {
          _id: "$attackType",
          count: { $sum: 1 },
          lastSeen: { $max: "$timestamp" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const suggestions = recentAttacks.map((attack) => ({
      attackType: attack._id,
      occurrences: attack.count,
      lastSeen: attack.lastSeen,
      ...(SUGGESTIONS[attack._id] ?? SUGGESTIONS["normal"]),
    }));

    if (suggestions.length === 0) {
      res.json({
        status: "clean",
        message: "No threats detected in last 24 hours 🟢",
        suggestions: [SUGGESTIONS["normal"]],
      });
      return;
    }

    res.json({
      status: "threats_detected",
      totalAttackTypes: suggestions.length,
      suggestions,
    });

  } catch (err) {
    console.error("Suggestions controller error:", err);
    res.status(500).json({ error: "Failed to fetch suggestions" });
  }
};