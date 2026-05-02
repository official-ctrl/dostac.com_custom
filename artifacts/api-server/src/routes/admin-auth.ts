import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, adminUsersTable } from "@workspace/db";
import { AdminLoginBody } from "@workspace/api-zod";
import {
  SESSION_COOKIE,
  createSession,
  destroySession,
  sessionCookieOptions,
  verifyPassword,
} from "../lib/auth";
import { requireAdmin } from "../middlewares/require-admin";

const router: IRouter = Router();

router.post("/admin/auth/login", async (req, res): Promise<void> => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { email, password } = parsed.data;
  const [user] = await db
    .select()
    .from(adminUsersTable)
    .where(eq(adminUsersTable.email, email.toLowerCase().trim()));
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  const { token } = await createSession(user.id);
  res.cookie(SESSION_COOKIE, token, sessionCookieOptions);
  res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
});

router.post("/admin/auth/logout", async (req, res): Promise<void> => {
  const token = req.cookies?.[SESSION_COOKIE];
  if (typeof token === "string" && token.length > 0) {
    await destroySession(token);
  }
  res.clearCookie(SESSION_COOKIE, { path: "/" });
  res.json({ ok: true });
});

router.get("/admin/auth/me", requireAdmin, async (req, res): Promise<void> => {
  const u = req.adminUser!;
  res.json({ id: u.id, email: u.email, name: u.name, role: u.role });
});

export default router;
