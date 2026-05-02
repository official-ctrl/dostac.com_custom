import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { eq, lt } from "drizzle-orm";
import { db, adminSessionsTable, adminUsersTable } from "@workspace/db";

export const SESSION_COOKIE = "dostac_admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function createSession(userId: number): Promise<{
  token: string;
  expiresAt: Date;
}> {
  const token = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.insert(adminSessionsTable).values({ userId, token, expiresAt });
  return { token, expiresAt };
}

export async function destroySession(token: string): Promise<void> {
  await db.delete(adminSessionsTable).where(eq(adminSessionsTable.token, token));
}

export async function getUserBySession(token: string) {
  if (!token) return null;
  const [row] = await db
    .select({
      session: adminSessionsTable,
      user: adminUsersTable,
    })
    .from(adminSessionsTable)
    .innerJoin(adminUsersTable, eq(adminUsersTable.id, adminSessionsTable.userId))
    .where(eq(adminSessionsTable.token, token));
  if (!row) return null;
  if (row.session.expiresAt.getTime() < Date.now()) {
    await destroySession(token);
    return null;
  }
  return row.user;
}

export async function purgeExpiredSessions(): Promise<void> {
  await db.delete(adminSessionsTable).where(lt(adminSessionsTable.expiresAt, new Date()));
}

export const sessionCookieOptions = {
  httpOnly: true as const,
  sameSite: "lax" as const,
  secure: process.env["NODE_ENV"] === "production",
  path: "/",
  maxAge: SESSION_TTL_MS,
};
