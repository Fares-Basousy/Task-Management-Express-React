import { z } from "zod";

export const VerifySignup = z.object({

  name: z.string().trim().min(1, "Name is required"),
  email: z.string().min(1, { message: "This field has to be filled." }).max(45,{ message: "Invalid email" }).email("This is not a valid email."),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export const VerifySignin = z.object({
  email: z.string().min(1, { message: "This field has to be filled." }).max(45,{ message: "Invalid email" }).email("This is not a valid email."),
  password: z.string().min(6, "Password must be at least 6 characters"),
});