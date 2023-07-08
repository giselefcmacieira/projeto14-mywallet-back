import { Router } from "express";
import transactionRouter from "./transactionsRoutes.js";
import userRouter from "./userRoutes.js";

const router = Router();

router.use(userRouter);
router.use(transactionRouter);

export default router;