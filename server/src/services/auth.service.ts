import bcrypt from "bcrypt";
import jwt, { SignOptions, Secret } from "jsonwebtoken";
import User from "../models/user.model"
import { VerifySignin, VerifySignup } from "@/validators/auth.validator";


export class AuthService {
  constructor() {}

  async signup(email: string, name: string, password: string) {
    try{
    const valid = VerifySignup.safeParse({email,name,password})
    if (!valid.success)
      return {status : 400, message : valid.error.issues.map(i => i.message).join(", ")}
    const existingUser = await User.findOne({email : email.toLowerCase()});

    if (existingUser) {
      return {status : 409 , message : "User already exists."}}
    else{
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({
        name : name,
        email : email.toLowerCase(),
        password : hashedPassword
      })
      await user.save()
      return {status : 201, message : "User created successfully"}

    }
  }catch(error : Error |any){
      return {status : 500, message : error.message}
    }

      }

  async login(email: string, password: string) {
    const valid = VerifySignin.safeParse({email,password})
    if (!valid.success)
      return {status : 400, message : valid.error.issues.map(i => i.message).join(", ")}
    const user = await User.findOne({email : email.toLowerCase()});

    if (!user || !user.password)
      return {status : 401, message : "Invalid credentials"}

    const checkPassowrd = await bcrypt.compare(password, user.password);
    if (!checkPassowrd) {
            return {status : 401, message : "Invalid credentials"}
    }

    const token = this.generateAccessToken(user._id.toString())

    return {
      status : 200,
      message : "Login successful",
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
      },
    };
  }


 
  private generateAccessToken(userId: string) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET as Secret,
      { expiresIn: 24*60*60 as SignOptions['expiresIn'] }
    );
  }



 
}