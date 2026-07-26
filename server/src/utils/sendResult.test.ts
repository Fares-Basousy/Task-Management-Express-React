import { describe, it, expect, vi } from "vitest";
import type { Response } from "express";
import { sendResult } from "./sendResult";

function createMockRes() {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe("sendResult", () => {
  it("sets the HTTP status from the service result", () => {
    const res = createMockRes();
    sendResult(res, { status: 201, message: "created" });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("strips status out of the JSON body and forwards message/data", () => {
    const res = createMockRes();
    sendResult(res, { status: 200, message: "ok", data: { id: "1" } });
    expect(res.json).toHaveBeenCalledWith({ message: "ok", data: { id: "1" } });
  });

  it("omits fields the service result did not set", () => {
    const res = createMockRes();
    sendResult(res, { status: 200, data: [1, 2, 3] });
    expect(res.json).toHaveBeenCalledWith({ data: [1, 2, 3] });
  });
});
