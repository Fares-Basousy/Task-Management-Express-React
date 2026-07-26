import express from "express";
import taskRouter from "@/routes/task.routes";
import authRouter from "@/routes/auth.routes";



const app = express();

app.use(express.json())
app.use("/api/auth", authRouter);
app.use("/api/tasks", taskRouter);

// Move Swagger docs before error handler





export default app;
