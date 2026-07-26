import { describe, it, expect, vi, beforeEach } from "vitest";
import { http } from "../../src/api/http";
import {
  createTask,
  updateTask,
  getTasks,
  search,
  filter,
  deleteTask,
} from "../../src/api/taskService";

vi.mock("../../src/api/http", () => ({
  http: {
    get: vi.fn(),
    post: vi.fn(),
    postForm: vi.fn(),
  },
}));

const rawTask = {
  _id: "task-1",
  name: "Write tests",
  description: "Cover the task service",
  status: 2,
  priority: 3,
  dueDate: Date.UTC(2026, 0, 15),
};

describe("taskService mapping", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createTask hits /tasks/create and unwraps+maps the response", async () => {
    vi.mocked(http.post).mockResolvedValue({ data: rawTask });

    const task = await createTask({
      name: "Write tests",
      description: "Cover the task service",
      status: 2,
      priority: 3,
      dueDate: rawTask.dueDate,
    });

    expect(http.post).toHaveBeenCalledWith("/tasks/create", expect.objectContaining({ name: "Write tests" }));
    // Mongo's _id/name are translated into the UI's id/title.
    expect(task).toEqual({
      id: "task-1",
      title: "Write tests",
      description: "Cover the task service",
      status: 2,
      priority: 3,
      dueDate: new Date(rawTask.dueDate).toISOString(),
    });
  });

  it("getTasks calls /tasks/get/<pageIndex> with a real path segment (not a literal ':')", async () => {
    vi.mocked(http.get).mockResolvedValue({ data: [rawTask] });

    const tasks = await getTasks(2);

    expect(http.get).toHaveBeenCalledWith("/tasks/get/2");
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe("Write tests");
  });

  it("getTasks returns an empty array when data is missing", async () => {
    vi.mocked(http.get).mockResolvedValue({ data: undefined as never });

    const tasks = await getTasks(0);

    expect(tasks).toEqual([]);
  });

  it("search URI-encodes the query text", async () => {
    vi.mocked(http.get).mockResolvedValue({ data: [] });

    await search("groceries & stuff", 0);

    expect(http.get).toHaveBeenCalledWith(`/tasks/search/0/${encodeURIComponent("groceries & stuff")}`);
  });

  it("filter builds a path with pageIndex/priority/status segments", async () => {
    vi.mocked(http.get).mockResolvedValue({ data: [] });

    await filter(1, 2, 3);

    expect(http.get).toHaveBeenCalledWith("/tasks/filter/1/2/3");
  });

  it("deleteTask hits /tasks/delete/<id>", async () => {
    vi.mocked(http.get).mockResolvedValue({ data: { id: "task-1" } });

    const result = await deleteTask("task-1");

    expect(http.get).toHaveBeenCalledWith("/tasks/delete/task-1");
    expect(result).toEqual({ id: "task-1" });
  });

  it("updateTask posts to /tasks/update and maps the returned task", async () => {
    vi.mocked(http.post).mockResolvedValue({ data: { ...rawTask, status: 1 } });

    const task = await updateTask({ id: "task-1", status: 1 });

    expect(http.post).toHaveBeenCalledWith("/tasks/update", { id: "task-1", status: 1 });
    expect(task.status).toBe(1);
  });
});
