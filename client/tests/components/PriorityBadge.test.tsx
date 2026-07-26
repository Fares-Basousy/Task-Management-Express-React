import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PriorityBadge from "../../src/components/PriorityBadge";

describe("PriorityBadge", () => {
  it.each([
    [1, "Low"],
    [2, "Medium"],
    [3, "High"],
  ] as const)("renders the label for priority %i", (priority, label) => {
    render(<PriorityBadge priority={priority} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
