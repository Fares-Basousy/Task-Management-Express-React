import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Pagination from "../../src/components/Pagination";

describe("Pagination", () => {
  it("shows the current 1-based page number", () => {
    render(<Pagination page={2} onPageChange={vi.fn()} productsCount={10} />);
    expect(screen.getByText("Page 2")).toBeInTheDocument();
  });

  it("disables Previous on page 1", () => {
    render(<Pagination page={1} onPageChange={vi.fn()} productsCount={10} />);
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
  });

  it("enables Previous past page 1", () => {
    render(<Pagination page={2} onPageChange={vi.fn()} productsCount={10} />);
    expect(screen.getByRole("button", { name: "Previous" })).toBeEnabled();
  });

  it("disables Next when fewer than a full page of results came back", () => {
    render(<Pagination page={1} onPageChange={vi.fn()} productsCount={4} />);
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });

  it("enables Next when a full page of results came back", () => {
    render(<Pagination page={1} onPageChange={vi.fn()} productsCount={10} />);
    expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();
  });

  it("calls onPageChange with page - 1 / page + 1", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Pagination page={2} onPageChange={onPageChange} productsCount={10} />);

    await user.click(screen.getByRole("button", { name: "Previous" }));
    expect(onPageChange).toHaveBeenCalledWith(1);

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });
});
