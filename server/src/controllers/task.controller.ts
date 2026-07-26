import { TaskService } from "@/services/task.service";
import { Request, Response, NextFunction } from "express";
import { sendResult } from "@/utils/sendResult";
export class TaskController  {
  constructor(private taskService: TaskService) {
  }

  createTask = async (req: Request,res: Response): Promise<any> => {
    const userId = req.user.userId;
    const { name, description, priority, status, dueDate } = req.body;

    return sendResult(res, await this.taskService.createTask(
      userId,
      name,
      description,
      priority,
      status,
      dueDate
    ));
  };

  deleteTask = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    const userId = req.user.userId;
    const { id }  = req.params;

    return sendResult(res, await this.taskService.deleteTask(userId, id as string));
  };

  updateTask = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    const userId = req.user.userId;

    const {
      id,
      name,
      description,
      priority,
      status,
      dueDate,
    } = req.body;

    // Build the patch from only the fields the client actually sent — this is
    // a partial update (e.g. the Kanban board only sends {id, status}), so
    // coercing every field unconditionally would turn missing ones into NaN
    // and, worse, Object.assign would overwrite name/description with undefined.
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (priority !== undefined) updates.priority = Number(priority);
    if (status !== undefined) updates.status = Number(status);
    if (dueDate !== undefined) updates.dueDate = Number(dueDate);

    return sendResult(res, await this.taskService.updateTask(userId, id, updates));
  };

  getTasks = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    const userId = req.user.userId;
    const parsedPageIndex = Number(req.params.pageIndex);
    const pageIndex = Number.isNaN(parsedPageIndex) || parsedPageIndex < 0 ? 0 : parsedPageIndex;
    return sendResult(res, await this.taskService.getTasks(userId, pageIndex));
  };

  filterTasks = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    const userId = req.user.userId;

    const { pageIndex, status, priority } = req.params;

    return sendResult(res, await this.taskService.filterTasks(
      userId,
      Number(pageIndex),
      Number(status),
      Number(priority)
    ));
  };

  searchTasks = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    const userId = req.user.userId;

    const { pageIndex, text } = req.params;

    return sendResult(res, await this.taskService.searchTasks(
      userId,
      text as string,
      Number(pageIndex)
    ));
  };
}