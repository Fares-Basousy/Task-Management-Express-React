import { describe, it, expect, vi, beforeEach } from "vitest";
import Task from "../models/task.model";
import { TaskService } from "./task.service";

vi.mock("../models/task.model", () => {
  const ctor = vi.fn();
  (ctor as any).find = vi.fn();
  (ctor as any).findOne = vi.fn();
  (ctor as any).deleteOne = vi.fn();
  return { default: ctor };
});

const mockedTask = Task as unknown as ReturnType<typeof vi.fn> & {
  find: ReturnType<typeof vi.fn>;
  findOne: ReturnType<typeof vi.fn>;
  deleteOne: ReturnType<typeof vi.fn>;
};

// Task.find(...).skip(...).limit(...) is a chainable query; this stubs that
// chain so tests can both resolve to a task list and assert the pagination math.
function mockFindChain(result: unknown[]) {
  const limit = vi.fn().mockResolvedValue(result);
  const skip = vi.fn().mockReturnValue({ limit });
  mockedTask.find.mockReturnValue({ skip });
  return { skip, limit };
}

describe("TaskService.createTask", () => {
  let service: TaskService;

  beforeEach(() => {
    service = new TaskService();
    vi.clearAllMocks();
  });

  it("rejects invalid input before creating a document", async () => {
    const result = await service.createTask("user-1", "", "no name given");
    expect(result.status).toBe(400);
  });

  it("saves a task scoped to the requesting user", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    mockedTask.mockImplementation((doc: any) => ({ ...doc, save }));

    const result = await service.createTask("user-1", "Write tests", "Cover the service", 2, 1, 123);

    expect(mockedTask).toHaveBeenCalledWith({
      userId: "user-1",
      name: "Write tests",
      description: "Cover the service",
      priority: 2,
      status: 1,
      dueDate: 123,
    });
    expect(save).toHaveBeenCalledTimes(1);
    expect(result.status).toBe(200);
    expect(result.data).toMatchObject({ userId: "user-1", name: "Write tests" });
  });

  it("returns 500 when saving fails", async () => {
    mockedTask.mockImplementation(() => ({
      save: vi.fn().mockRejectedValue(new Error("write failed")),
    }));

    const result = await service.createTask("user-1", "Write tests", "Cover the service");

    expect(result).toEqual({ status: 500, message: "write failed" });
  });
});

describe("TaskService.deleteTask", () => {
  let service: TaskService;

  beforeEach(() => {
    service = new TaskService();
    vi.clearAllMocks();
  });

  it("returns 404 when the task doesn't belong to the user (or doesn't exist)", async () => {
    mockedTask.findOne.mockResolvedValue(null);

    const result = await service.deleteTask("user-1", "task-1");

    expect(mockedTask.findOne).toHaveBeenCalledWith({ _id: "task-1", userId: "user-1" });
    expect(result).toEqual({ status: 404, message: "Task not found." });
  });

  it("deletes the task and returns its id when found", async () => {
    mockedTask.findOne.mockResolvedValue({ _id: "task-1" });
    mockedTask.deleteOne.mockResolvedValue({ acknowledged: true });

    const result = await service.deleteTask("user-1", "task-1");

    expect(mockedTask.deleteOne).toHaveBeenCalledWith({ _id: "task-1" });
    expect(result).toEqual({
      status: 200,
      message: "Task deleted successfully.",
      data: { id: "task-1" },
    });
  });
});

describe("TaskService.updateTask", () => {
  let service: TaskService;

  beforeEach(() => {
    service = new TaskService();
    vi.clearAllMocks();
  });

  it("rejects an out-of-range status", async () => {
    const result = await service.updateTask("user-1", "task-1", { status: 9 });
    expect(result.status).toBe(400);
    expect(mockedTask.findOne).not.toHaveBeenCalled();
  });

  it("returns 404 when the task isn't found for that user", async () => {
    mockedTask.findOne.mockResolvedValue(null);

    const result = await service.updateTask("user-1", "task-1", { status: 2 });

    expect(result).toEqual({ status: 404, message: "Task not found." });
  });

  // Regression: a partial update (e.g. the Kanban board only sends {status})
  // must not clobber fields it didn't include.
  it("merges a partial update onto the existing document instead of overwriting it", async () => {
    const task: any = { name: "Original name", status: 1, save: vi.fn().mockResolvedValue(undefined) };
    mockedTask.findOne.mockResolvedValue(task);

    const result = await service.updateTask("user-1", "task-1", { status: 3 });

    expect(task.status).toBe(3);
    expect(task.name).toBe("Original name");
    expect(task.save).toHaveBeenCalledTimes(1);
    expect(result.status).toBe(200);
  });
});

describe("TaskService pagination", () => {
  let service: TaskService;

  beforeEach(() => {
    service = new TaskService();
    vi.clearAllMocks();
  });

  it("getTasks skips 0 documents on the first page (pageIndex 0)", async () => {
    const { skip, limit } = mockFindChain([{ name: "a" }]);

    await service.getTasks("user-1", 0);

    expect(mockedTask.find).toHaveBeenCalledWith({ userId: "user-1" });
    expect(skip).toHaveBeenCalledWith(0);
    expect(limit).toHaveBeenCalledWith(10);
  });

  it("getTasks skips a full page of 10 per pageIndex", async () => {
    const { skip } = mockFindChain([]);

    await service.getTasks("user-1", 2);

    expect(skip).toHaveBeenCalledWith(20);
  });

  it("filterTasks only applies status/priority filters within the valid 1-3 range", async () => {
    mockFindChain([]);

    await service.filterTasks("user-1", 0, 9, 9);

    expect(mockedTask.find).toHaveBeenCalledWith({ userId: "user-1" });
  });

  it("filterTasks applies valid status and priority filters", async () => {
    mockFindChain([]);

    await service.filterTasks("user-1", 0, 2, 3);

    expect(mockedTask.find).toHaveBeenCalledWith({ userId: "user-1", status: 2, priority: 3 });
  });

  it("searchTasks matches on title with a case-insensitive regex", async () => {
    mockFindChain([]);

    await service.searchTasks("user-1", "groceries", 0);

    expect(mockedTask.find).toHaveBeenCalledWith({
      userId: "user-1",
      name: { $regex: "groceries", $options: "i" },
    });
  });
});
