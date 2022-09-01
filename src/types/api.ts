/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';

interface ValidationErrors {
  field?: string;
  message: string[];
}

export class HttpError extends Error {
  status: number;

  message: string;

  errors?: ValidationErrors;

  constructor(status: number, message: string, errors?: ValidationErrors) {
    super(message);
    this.status = status;
    this.message = message;
    this.errors = errors;
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
  errors?: ValidationErrors;
  stack?: string;
}
export default Handler;
