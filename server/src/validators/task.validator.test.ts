import { describe, it, expect } from "vitest";
import { VerifyCreateTask, VerifyUpdateTask } from "./task.validator";

describe("VerifyCreateTask", () => {
  it("accepts a fully populated task", () => {
    const result = VerifyCreateTask.safeParse({
      name: "Write tests",
      description: "Cover the task service",
      priority: 2,
      status: 1,
      dueDate: Date.now(),
    });
    expect(result.success).toBe(true);
  });

  it("accepts a task with only the required fields", () => {
    const result = VerifyCreateTask.safeParse({
      name: "Write tests",
      description: "Cover the task service",
    });
    expect(result.success).toBe(true);
  });

  it("requires a non-empty name", () => {
    const result = VerifyCreateTask.safeParse({ name: "", description: "x" });
    expect(result.success).toBe(false);
  });

  it("requires a non-empty description", () => {
    const result = VerifyCreateTask.safeParse({ name: "a", description: "" });
    expect(result.success).toBe(false);
  });

  // Status/priority are UI-driven enums with exactly three values (To Do/In
  // Progress/Done and Low/Medium/High) — anything outside 1-3 isn't displayable.
  it.each([0, 4, -1])("rejects a status of %i (outside 1-3)", (status) => {
    const result = VerifyCreateTask.safeParse({ name: "a", description: "b", status });
    expect(result.success).toBe(false);
  });

  it.each([1, 2, 3])("accepts a status of %i", (status) => {
    const result = VerifyCreateTask.safeParse({ name: "a", description: "b", status });
    expect(result.success).toBe(true);
  });

  it.each([0, 4, -1])("rejects a priority of %i (outside 1-3)", (priority) => {
    const result = VerifyCreateTask.safeParse({ name: "a", description: "b", priority });
    expect(result.success).toBe(false);
  });
});

describe("VerifyUpdateTask", () => {
  it("requires an id but allows every other field to be omitted", () => {
    const result = VerifyUpdateTask.safeParse({ id: "task-1" });
    expect(result.success).toBe(true);
  });

  it("fails without an id", () => {
    const result = VerifyUpdateTask.safeParse({ name: "no id given" });
    expect(result.success).toBe(false);
  });

  it("still enforces the 1-3 range on partial updates", () => {
    const result = VerifyUpdateTask.safeParse({ id: "task-1", status: 5 });
    expect(result.success).toBe(false);
  });
});
