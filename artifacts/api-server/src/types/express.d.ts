import type { AdminUser } from "@workspace/db";

declare global {
  namespace Express {
    interface Request {
      adminUser?: AdminUser;
    }
  }
}

export {};
