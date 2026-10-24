import { Response } from 'express';

export interface ApiResponseEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode = 200
): Response {
  const envelope: ApiResponseEnvelope<T> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };
  return res.status(statusCode).json(envelope);
}
