import { Router, type IRouter, type Request, type Response } from "express";
import multer from "multer";
import { randomUUID } from "crypto";
import { requireAdmin } from "../middlewares/require-admin";
import { db, mediaUploadsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
]);

router.post(
  "/admin/uploads",
  requireAdmin,
  upload.single("file"),
  async (req: Request, res: Response): Promise<void> => {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: "파일이 없습니다." });
      return;
    }
    const contentType = file.mimetype || "application/octet-stream";
    if (!ALLOWED_IMAGE_TYPES.has(contentType.toLowerCase())) {
      res.status(400).json({ error: `지원하지 않는 파일 형식: ${contentType}` });
      return;
    }
    try {
      const id = randomUUID();
      const data = file.buffer.toString("base64");
      await db.insert(mediaUploadsTable).values({ id, contentType, data, size: file.size });
      const publicUrl = `/api/storage/uploads/${id}`;
      res.json({ publicUrl, key: publicUrl });
    } catch (err) {
      req.log.error({ err }, "Failed to store upload");
      res.status(500).json({ error: "업로드 저장 실패" });
    }
  }
);

router.get("/storage/uploads/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const [row] = await db.select().from(mediaUploadsTable).where(eq(mediaUploadsTable.id, req.params.id));
    if (!row) {
      res.status(404).json({ error: "파일을 찾을 수 없습니다." });
      return;
    }
    const buf = Buffer.from(row.data, "base64");
    res.setHeader("Content-Type", row.contentType);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.setHeader("Content-Length", String(buf.length));
    res.end(buf);
  } catch (err) {
    req.log.error({ err }, "Failed to serve upload");
    res.status(500).json({ error: "파일 서빙 실패" });
  }
});

export default router;
