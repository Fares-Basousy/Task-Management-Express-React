import { Router } from "express";
import { AuthController } from "@/controllers/auth.controller";
import { AuthService } from "@/services/auth.service";

const authRouter = Router();

const authController = new AuthController(new AuthService());

authRouter.post("/signup", authController.signup);

authRouter.post("/login", authController.login);


export default authRouter;
