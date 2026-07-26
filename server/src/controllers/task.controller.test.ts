import { describe, it, expect, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { TaskController } from "./task.controller";
import type { TaskService } from "@/services/task.service";

function createMockRes() {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

const next = vi.fn() as unknown as NextFunction;

function createService(overrides: Partial<Record<keyof TaskService, unknown>> = {}) {
  return {
    createTask: vi.fn().mockResolvedValue({ status: 200 }),
    deleteTask: vi.fn().mockResolvedValue({ status: 200 }),
    updateTask: vi.fn().mockResolvedValue({ status: 200 }),
    getTasks: vi.fn().mockResolvedValue({ status: 200, data: [] }),
    filterTasks: vi.fn().mockResolvedValue({ status: 200, data: [] }),
    searchTasks: vi.fn().mockResolvedValue({ status: 200, data: [] }),
    ...overrides,
  } as unknown as TaskService;
}

// Regression coverage for the bug where updateTask ran Number() on every
// field unconditionally: a Kanban drag sending only {id, status} turned the
// missing priority/dueDate into NaN and failed Zod validation.
describe("TaskController.updateTask", () => {
  it("only forwards fields the client actually sent (partial patch)", async () => {
    const service = createService();
    const controller = new TaskController(service);
    const req = {
      user: { userId: "user-1", role: "user" },
      body: { id: "task-1", status: 3 },
    } as unknown as Request;
    const res = createMockRes();

    await controller.updateTask(req, res, next);

    expect(service.updateTask).toHaveBeenCalledWith("user-1", "task-1", { status: 3 });
  });

  it("coerces provided priority/status/dueDate to numbers", async () => {
    const service = createService();
    const controller = new TaskController(service);
    const req = {
      user: { userId: "user-1", role: "user" },
      body: { id: "task-1", priority: "2", status: "1", dueDate: "12345" },
    } as unknown as Request;
    const res = createMockRes();

    await controller.updateTask(req, res, next);

    expect(service.updateTask).toHaveBeenCalledWith("user-1", "task-1", {
      priority: 2,
      status: 1,
      dueDate: 12345,
    });
  });
});

describe("TaskController.getTasks", () => {
  it("defaults an unparsable pageIndex to 0", async () => {
    const service = createService();
    const controller = new TaskController(service);
    const req = {
      user: { userId: "user-1", role: "user" },
      params: { pageIndex: "not-a-number" },
    } as unknown as Request;
    const res = createMockRes();

    await controller.getTasks(req, res, next);

    expect(service.getTasks).toHaveBeenCalledWith("user-1", 0);
  });

  it("defaults a negative pageIndex to 0", async () => {
    const service = createService();
    const controller = new TaskController(service);
    const req = {
      user: { userId: "user-1", role: "user" },
      params: { pageIndex: "-3" },
    } as unknown as Request;
    const res = createMockRes();

    await controller.getTasks(req, res, next);

    expect(service.getTasks).toHaveBeenCalledWith("user-1", 0);
  });

  it("passes through a valid pageIndex", async () => {
    const service = createService();
    const controller = new TaskController(service);
    const req = {
      user: { userId: "user-1", role: "user" },
      params: { pageIndex: "3" },
    } as unknown as Request;
    const res = createMockRes();

    await controller.getTasks(req, res, next);

    expect(service.getTasks).toHaveBeenCalledWith("user-1", 3);
  });
});

describe("TaskController response wiring", () => {
  it("sends the service result's status code and JSON body", async () => {
    const service = createService({
      createTask: vi.fn().mockResolvedValue({ status: 201, message: "created", data: { id: "1" } }),
    });
    const controller = new TaskController(service);
    const req = {
      user: { userId: "user-1", role: "user" },
      body: { name: "Task", description: "desc" },
    } as unknown as Request;
    const res = createMockRes();

    await controller.createTask(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: "created", data: { id: "1" } });
  });
});
