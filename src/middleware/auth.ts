import jwt, { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import { HttpError } from '../types/api';
import secret from '../constants';
import User from '../models/user';

const authMiddleware = asyncHandler(async (req, _res, next) => {
  try {
    const { authorization } = req.headers;
    // check bearer is present
    if (authorization && authorization.startsWith('Bearer ')) {
      const token = authorization.split(' ')[1];
      const decoded = jwt.verify(token, secret);
      const id = typeof decoded === 'string' ? decoded : decoded.id;
      // get user
      const user = await User.findById(id).select('-password');
      if (!user) {
        throw new HttpError(400, 'User does not exist');
      }
      req.user = user;
      next();
    } else {
      throw new HttpError(401, 'token is not present');
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);

    if (error instanceof TokenExpiredError) {
      throw new HttpError(401, 'token has expired');
    }
    if (error instanceof JsonWebTokenError) {
      throw new HttpError(400, error.message);
    }
    if (error instanceof HttpError) {
      throw new HttpError(error.status, error.message);
    }

    throw new HttpError(401, 'unauthorized');
  }
});

export default authMiddleware;
