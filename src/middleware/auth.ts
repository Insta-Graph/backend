import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { MiddlewareFn } from 'type-graphql';
import { HttpError } from '../types/api';
import { ACCESS_TOKEN_SECRET } from '../constants/index';
import { CustomContext } from '../types/graph';

const isAuthenticated: MiddlewareFn<CustomContext> = ({ context }, next) => {
  try {
    const authHeader = context.req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1];
      const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
      const id = typeof decoded === 'string' ? decoded : decoded.id;

      context.payload = { userId: id };
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

  return next();
};

export default isAuthenticated;
