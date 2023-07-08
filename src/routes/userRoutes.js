import { Router } from "express";
import { signIn, signOut, singUp } from "../controllers/authController.js";
import { validateSchema } from "../middlewares/validateSchema.js";
import { newUserSchema } from "../schemas/newUserSchema.js";
import { userSchema } from "../schemas/userSchema.js";


const userRouter = Router();

userRouter.post('/sign-up', validateSchema(newUserSchema), singUp);

userRouter.post('/sign-in', validateSchema(userSchema),signIn);

userRouter.delete('/sign-out', signOut);

export default userRouter;