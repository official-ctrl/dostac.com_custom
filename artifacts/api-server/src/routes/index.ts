import { Router, type IRouter } from "express";
import healthRouter from "./health";
import publicProductsRouter from "./public-products";
import publicNoticesRouter from "./public-notices";
import publicContactRouter from "./public-contact";
import adminAuthRouter from "./admin-auth";
import adminProductsRouter from "./admin-products";
import adminNoticesRouter from "./admin-notices";
import adminInquiriesRouter from "./admin-inquiries";
import adminTranslateRouter from "./admin-translate";
import adminUploadsRouter from "./admin-uploads";

const router: IRouter = Router();

router.use(healthRouter);
router.use(publicProductsRouter);
router.use(publicNoticesRouter);
router.use(publicContactRouter);
router.use(adminAuthRouter);
router.use(adminProductsRouter);
router.use(adminNoticesRouter);
router.use(adminInquiriesRouter);
router.use(adminTranslateRouter);
router.use(adminUploadsRouter);

export default router;
