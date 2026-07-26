import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TaskRow from "../../src/components/TaskRow";
import type { Task } from "../../src/types";

const task: Task = {
  id: "task-1",
  title: "Write tests",
  description: "Cover the task row",
  status: 1,
  priority: 2,
  dueDate: new Date(Date.UTC(2026, 0, 15)).toISOString(),
};

function renderRow(onSave = vi.fn(), onDelete = vi.fn()) {
  render(
    <table>
      <tbody>
        <TaskRow task={task} onSave={onSave} onDelete={onDelete} />
      </tbody>
    </table>
  );
}

describe("TaskRow", () => {
  it("renders the task's title and description", () => {
    renderRow();
    expect(screen.getByText("Write tests")).toBeInTheDocument();
    expect(screen.getByText("Cover the task row")).toBeInTheDocument();
  });

  it("enters edit mode and pre-fills the title field from the task", async () => {
    const user = userEvent.setup();
    renderRow();

    await user.click(screen.getByRole("button", { name: "Edit" }));

    expect(screen.getByLabelText("Title")).toHaveValue("Write tests");
  });

  it("blocks saving and shows an error when the title is cleared", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    renderRow(onSave);

    await user.click(screen.getByRole("button", { name: "Edit" }));
    await user.clear(screen.getByLabelText("Title"));
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByText("Title cannot be empty.")).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  // Regression: the edit form used to be typed as TaskFormValues but read
  // draft.title (a field that type doesn't have) instead of draft.name.
  it("saves with the edited name under the `name` field, matching TaskFormValues", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    renderRow(onSave);

    await user.click(screen.getByRole("button", { name: "Edit" }));
    const titleInput = screen.getByLabelText("Title");
    await user.clear(titleInput);
    await user.type(titleInput, "Write more tests");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onSave).toHaveBeenCalledWith(
      "task-1",
      expect.objectContaining({ name: "Write more tests" })
    );
  });

  // Regression: the save path must convert the "yyyy-mm-dd" input value to a
  // unix-millisecond number before calling onSave — sending the raw string
  // failed backend validation (Number(dateString) is NaN).
  it("converts the due date to a millisecond number before saving", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    renderRow(onSave);

    await user.click(screen.getByRole("button", { name: "Edit" }));
    await user.click(screen.getByRole("button", { name: "Save" }));

    const [, payload] = onSave.mock.calls[0];
    expect(typeof payload.dueDate).toBe("number");
    expect(Number.isNaN(payload.dueDate)).toBe(false);
  });

  it("calls onDelete with the task id when Remove is clicked", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn().mockResolvedValue(undefined);
    renderRow(vi.fn(), onDelete);

    await user.click(screen.getByRole("button", { name: "Remove" }));

    expect(onDelete).toHaveBeenCalledWith("task-1");
  });
});
