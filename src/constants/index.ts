import dotenv from 'dotenv';
import crypto from 'crypto';
import User from '../entity/User';

dotenv.config();

export const ACCESS_TOKEN_SECRET =
  process.env.JWT_ACCESS_SECRET || crypto.randomBytes(20).toString('hex');

export const REFRESH_TOKEN_SECRET =
  process.env.JWT_REFRESH_SECRET || crypto.randomBytes(20).toString('hex');

export const ENVIRONMENT = process.env.ENVIRONMENT ?? false;

export const IS_DEVELOPMENT_ENV = ENVIRONMENT && ENVIRONMENT === 'development';

export const TOKEN_EXPIRATION = 900;

export const TOKEN_REFRESH_EXPIRATION = 86400;

export const ENTITIES = [User] as const;
