import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StatusBadge from "../../src/components/StatusBadge";

describe("StatusBadge", () => {
  it.each([
    [1, "To Do"],
    [2, "In Progress"],
    [3, "Done"],
  ] as const)("renders the label for status %i", (status, label) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
