import { Router, type IRouter } from "express";
import healthRouter from "./health";
import delegationRouter from "./delegation";
import swapRouter from "./swap";

const router: IRouter = Router();

router.use(healthRouter);
router.use(delegationRouter);
router.use(swapRouter);

export default router;
