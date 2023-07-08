import { Router } from "express";
import { addTransaction, userTransactions } from "../controllers/transactionsController.js";
import { validateToken } from "../middlewares/validateToken.js";
import { validateTransactionSchema } from "../middlewares/validateTransactionSchema.js";

const transactionRouter = Router();

transactionRouter.post('/new-transaction/:type', validateTransactionSchema, validateToken, addTransaction);

transactionRouter.get('/my-transactions', validateToken, userTransactions);

export default transactionRouter;
