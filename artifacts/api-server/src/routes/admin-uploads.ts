import { Router, type IRouter, type Request, type Response } from "express";
import { Readable } from "stream";
import { AdminSignUploadBody } from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/require-admin";
import {
  ObjectStorageService,
  ObjectNotFoundError,
} from "../lib/objectStorage";

const router: IRouter = Router();
const objectStorageService = new ObjectStorageService();

router.use("/admin/uploads/sign", requireAdmin);

/**
 * Image upload signing — returns a Replit Object Storage presigned PUT URL
 * for direct browser → GCS upload. The admin then stores the public serving
 * URL (key) in the database.
 */
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
]);

router.post("/admin/uploads/sign", async (req: Request, res: Response): Promise<void> => {
  const parsed = AdminSignUploadBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { contentType, filename } = parsed.data;
  if (!ALLOWED_IMAGE_TYPES.has(contentType.toLowerCase())) {
    res.status(400).json({
      error: `Unsupported content type: ${contentType}. Allowed: ${Array.from(ALLOWED_IMAGE_TYPES).join(", ")}`,
    });
    return;
  }
  if (!filename || filename.length > 256) {
    res.status(400).json({ error: "Invalid filename" });
    return;
  }

  try {
    const uploadUrl = await objectStorageService.getObjectEntityUploadURL();
    const key = objectStorageService.normalizeObjectEntityPath(uploadUrl);
    const publicUrl = `/api/storage${key}`;
    res.json({ uploadUrl, publicUrl, key });
  } catch (err) {
    req.log.error({ err }, "Failed to sign upload URL");
    res.status(500).json({ error: "Failed to sign upload URL" });
  }
});

/**
 * GET /api/storage/objects/* — serve uploaded objects from PRIVATE_OBJECT_DIR.
 * No auth/ACL: stored URLs are opaque UUIDs and must be publicly fetchable
 * because both the admin UI and the public site need to render them.
 */
router.get("/storage/objects/*objectPath", async (req: Request, res: Response): Promise<void> => {
  try {
    const raw = req.params.objectPath;
    const wildcardPath = Array.isArray(raw) ? raw.join("/") : raw;
    const objectPath = `/objects/${wildcardPath}`;
    const objectFile = await objectStorageService.getObjectEntityFile(objectPath);
    const response = await objectStorageService.downloadObject(objectFile);

    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));

    if (response.body) {
      const nodeStream = Readable.fromWeb(
        response.body as ReadableStream<Uint8Array>,
      );
      nodeStream.pipe(res);
    } else {
      res.end();
    }
  } catch (err) {
    if (err instanceof ObjectNotFoundError) {
      res.status(404).json({ error: "Object not found" });
      return;
    }
    req.log.error({ err }, "Error serving object");
    res.status(500).json({ error: "Failed to serve object" });
  }
});

/**
 * GET /api/storage/public-objects/* — serve files placed by an operator
 * directly in the bucket via the Replit Object Storage UI.
 */
router.get("/storage/public-objects/*filePath", async (req: Request, res: Response): Promise<void> => {
  try {
    const raw = req.params.filePath;
    const filePath = Array.isArray(raw) ? raw.join("/") : raw;
    const file = await objectStorageService.searchPublicObject(filePath);
    if (!file) {
      res.status(404).json({ error: "File not found" });
      return;
    }
    const response = await objectStorageService.downloadObject(file);

    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));

    if (response.body) {
      const nodeStream = Readable.fromWeb(
        response.body as ReadableStream<Uint8Array>,
      );
      nodeStream.pipe(res);
    } else {
      res.end();
    }
  } catch (err) {
    req.log.error({ err }, "Error serving public object");
    res.status(500).json({ error: "Failed to serve public object" });
  }
});

export default router;
