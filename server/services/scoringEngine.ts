interface RequestData {
  body: string;
  url: string;
  endpoint: string;
  userAgent: string;
}

interface HistoryItem {
  timestamp: Date;
  endpoint: string;
  status: string;
}

interface ScoreResult {
  score: number;
  attackType: string;
  status: "allowed" | "flagged" | "blocked";
}

const RULES = {
  requestsPerMinute:    { threshold: 60, score: 40 },
  requestsPer10Sec:     { threshold: 20, score: 30 },
  loginAttemptsPerHour: { threshold: 10, score: 50 },
  botTimingMs:          { threshold: 100, score: 35 },
};

const INJECTION_PATTERNS: Record<string, { pattern: RegExp; score: number }> = {
  SQL_INJECTION:  { pattern: /(\bSELECT\b|\bDROP\b|\bUNION\b|\bINSERT\b|--|;)/i, score: 60 },
  XSS_ATTACK:     { pattern: /<script>|javascript:|onerror=|onload=/i,             score: 55 },
  PATH_TRAVERSAL: { pattern: /\.\.\//,                                             score: 45 },
  CMD_INJECTION:  { pattern: /(\||;|`|\$\()/,                                      score: 50 },
};

const BOT_AGENTS = /curl|python|scrapy|bot|crawler|wget/i;
const SENSITIVE_ENDPOINTS = ["/admin", "/login", "/api/auth", "/wp-admin"];

export function calculate(
  ip: string,
  reqData: RequestData,
  history: HistoryItem[]
): ScoreResult {
  let score = 0;
  let attackType = "normal";
  const now = Date.now();

  // Rule 1: Requests per minute
  const lastMinute = history.filter(r =>
    new Date(r.timestamp).getTime() > now - 60000
  ).length;
  if (lastMinute > RULES.requestsPerMinute.threshold) {
    score += RULES.requestsPerMinute.score;
    attackType = "RATE_ABUSE";
  }

  // Rule 2: Burst detection (per 10 seconds)
  const last10Sec = history.filter(r =>
    new Date(r.timestamp).getTime() > now - 10000
  ).length;
  if (last10Sec > RULES.requestsPer10Sec.threshold) {
    score += RULES.requestsPer10Sec.score;
    attackType = "DDOS";
  }

  // Rule 3: Brute force on login
  const loginAttempts = history.filter(r =>
    r.endpoint === "/login" &&
    new Date(r.timestamp).getTime() > now - 3600000
  ).length;
  if (loginAttempts > RULES.loginAttemptsPerHour.threshold) {
    score += RULES.loginAttemptsPerHour.score;
    attackType = "BRUTE_FORCE";
  }

  // Rule 4: Injection detection
  const payload = (reqData.body || "") + (reqData.url || "");
  for (const [type, rule] of Object.entries(INJECTION_PATTERNS)) {
    if (rule.pattern.test(payload)) {
      score += rule.score;
      attackType = type;
      break;
    }
  }

  // Rule 5: Bot user agent
  if (BOT_AGENTS.test(reqData.userAgent || "")) {
    score += 25;
    attackType = "BOT_TRAFFIC";
  }

  // Rule 6: Sensitive endpoint + high frequency
  if (SENSITIVE_ENDPOINTS.includes(reqData.endpoint) && lastMinute > 5) {
    score += 20;
  }

  // Rule 7: Bot timing (requests too fast)
  if (history.length >= 5) {
    const times = history
      .slice(0, 5)
      .map(r => new Date(r.timestamp).getTime());
    const diffs = times
      .slice(1)
      .map((t, i) => Math.abs(t - (times[i] ?? 0)));
    const avg = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    if (avg < RULES.botTimingMs.threshold) {
      score += RULES.botTimingMs.score;
      attackType = "BOT_TRAFFIC";
    }
  }

  const finalScore = Math.min(score, 100);

  return {
    score: finalScore,
    attackType,
    status: finalScore > 60 ? "blocked" : finalScore > 30 ? "flagged" : "allowed"
  };
}