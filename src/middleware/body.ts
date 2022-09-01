import * as yup from 'yup';
import asyncHandler from 'express-async-handler';
import { HttpError } from '../types/api';

const bodyMiddleware = (schema: yup.AnyObjectSchema) =>
  asyncHandler(async (req, _res, next) => {
    try {
      await schema.validate(req.body, { abortEarly: true });
      return next();
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const errors = { field: err.path, message: err.errors };
        throw new HttpError(400, 'invalid data', errors);
      }
      throw new HttpError(500, 'Something went wrong');
    }
  });

export default bodyMiddleware;
