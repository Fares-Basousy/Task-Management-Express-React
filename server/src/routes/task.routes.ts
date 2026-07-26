import { Router } from "express";
import { TaskController } from "@/controllers/task.controller";
import { TaskService } from "@/services/task.service";
import { requireAuth } from "@/middleware/authMiddleware";

const taskRouter = Router();
const taskController = new TaskController(new TaskService());

taskRouter.use(requireAuth);

taskRouter.post("/update", taskController.updateTask);

taskRouter.post("/create", taskController.createTask);

taskRouter.get("/get/:pageIndex",taskController.getTasks);

taskRouter.get("/search/:pageIndex/:text",taskController.searchTasks);

taskRouter.get("/filter/:pageIndex/:priority?/:status?",taskController.filterTasks);

taskRouter.get("/delete/:id", taskController.deleteTask);

export default taskRouter;
