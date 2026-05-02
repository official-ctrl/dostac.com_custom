import type { Request, Response, NextFunction } from "express";
import { SESSION_COOKIE, getUserBySession } from "../lib/auth";

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
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
