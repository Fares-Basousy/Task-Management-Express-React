import { Response } from "express";

export interface ServiceResult {
  status: number;
  message?: string;
  data?: unknown;
}

// Every service method returns { status, message?, data? }; this is the one
// place that turns that shape into an actual HTTP response.
export function sendResult(res: Response, result: ServiceResult): Response {
  const { status, ...body } = result;
  return res.status(status).json(body);
}
