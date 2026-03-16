import { Router, type IRouter } from "express";
import healthRouter from "./health";
import delegationRouter from "./delegation";

const router: IRouter = Router();

router.use(healthRouter);
router.use(delegationRouter);

export default router;
