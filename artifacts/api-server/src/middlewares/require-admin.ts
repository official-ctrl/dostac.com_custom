import type { Request, Response, NextFunction } from "express";
import { SESSION_COOKIE, getUserBySession } from "../lib/auth";

const IMPORT_API_KEY = process.env["IMPORT_API_KEY"];

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  // ── API Key auth (for server-to-server integrations) ──────────────────────
  const apiKey = req.headers["x-api-key"];
  if (typeof apiKey === "string" && apiKey.length > 0) {
    if (!IMPORT_API_KEY) {
      res.status(500).json({ error: "API key auth not configured" });
      return;
    }
    if (apiKey === IMPORT_API_KEY) {
      req.adminUser = {
        id: 0,
        email: "api@import",
        name: "Import API",
        role: "admin",
        passwordHash: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      next();
      return;
    }
    res.status(401).json({ error: "Invalid API key" });
    return;
  }

  // ── Cookie session auth ───────────────────────────────────────────────────
  const token = req.cookies?.[SESSION_COOKIE];
  if (typeof token !== "string" || token.length === 0) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const user = await getUserBySession(token);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.adminUser = user;
  next();
}
