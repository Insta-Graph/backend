import { IS_DEVELOPMENT_ENV } from '../constants/index';
import { ErrorMiddlewareHandler, ErrorResponse } from '../types/api';

const errorMiddleware: ErrorMiddlewareHandler = (err, _req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Something went wrong';
  const errorObject: ErrorResponse = { status, message };
  if (err.errors) {
    errorObject.errors = err.errors;
  }
  if (IS_DEVELOPMENT_ENV) {
    errorObject.stack = err.stack;
  }
  res.status(status).json({ ...errorObject });
  next();
};

export default errorMiddleware;
