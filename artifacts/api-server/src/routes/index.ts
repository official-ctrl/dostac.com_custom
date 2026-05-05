import { Router, type IRouter } from "express";
import healthRouter from "./health";
import publicProductsRouter from "./public-products";
import publicNoticesRouter from "./public-notices";
import publicContactRouter from "./public-contact";
import publicBannersRouter from "./public-banners";
import adminAuthRouter from "./admin-auth";
import adminProductsRouter from "./admin-products";
import adminNoticesRouter from "./admin-notices";
import adminInquiriesRouter from "./admin-inquiries";
import adminTranslateRouter from "./admin-translate";
import adminUploadsRouter from "./admin-uploads";
import adminBannersRouter from "./admin-banners";
import publicAboutRouter from "./public-about";
import adminAboutRouter from "./admin-about";
import publicProcessRouter from "./public-process";
import adminProcessRouter from "./admin-process";

const router: IRouter = Router();

router.use(healthRouter);
router.use(publicProductsRouter);
router.use(publicNoticesRouter);
router.use(publicContactRouter);
router.use(publicBannersRouter);
router.use(adminAuthRouter);
router.use(adminProductsRouter);
router.use(adminNoticesRouter);
router.use(adminInquiriesRouter);
router.use(adminTranslateRouter);
router.use(adminUploadsRouter);
router.use(adminBannersRouter);
router.use(publicAboutRouter);
router.use(adminAboutRouter);
router.use(publicProcessRouter);
router.use(adminProcessRouter);

export default router;
