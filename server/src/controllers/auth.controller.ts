import { Request, Response, NextFunction } from "express";
import { AuthService } from "@/services/auth.service";
import { sendResult } from "@/utils/sendResult";

export class AuthController {
  constructor(private authService: AuthService) {
  }

  signup = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { email, name, password } = req.body;
    return sendResult(res, await this.authService.signup(email, name, password));
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { email, password } = req.body;
    return sendResult(res, await this.authService.login(email, password));
  };


}
