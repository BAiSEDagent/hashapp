import { Router, type IRouter } from "express";
import healthRouter from "./health";
import delegationRouter from "./delegation";
import swapRouter from "./swap";
import agentRouter from "./agent";
import gatewayRouter from "./gateway";

const router: IRouter = Router();

router.use(healthRouter);
router.use(delegationRouter);
router.use(swapRouter);
router.use(agentRouter);
router.use("/gateway", gatewayRouter);

export default router;
