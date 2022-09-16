import { Request, Response, NextFunction } from 'express';
import RefreshTokenService from '../middleware/refreshToken';

const refreshTokenService = new RefreshTokenService();
type ExpressHandler = typeof refreshTokenService.refreshToken;

// eslint-disable-next-line import/prefer-default-export
export const asyncHandlerUtil =
  <T extends ExpressHandler>(fn: T) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
