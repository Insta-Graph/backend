/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';

export class HttpError extends Error {
  status: number;

  message: string;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.message = message;
  }
}
type Handler = (req: Request, res: Response) => any;

export type MiddlewareHandler = (req: Request, res: Response, next: NextFunction) => any;

export type ErrorMiddlewareHandler = (
  err: HttpError,
  req: Request,
  res: Response,
  next: NextFunction
) => void;

export interface ErrorResponse {
  status: number;
  message: string;
  stack?: string;
}
export default Handler;
