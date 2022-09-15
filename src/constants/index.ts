import dotenv from 'dotenv';
import User from '../entity/User';

dotenv.config();

const secret = process.env.JWT_SECRET || 'jsvknakln';

export const ENVIRONMENT = process.env.ENVIRONMENT ?? false;

export const IS_DEVELOPMENT_ENV = ENVIRONMENT && ENVIRONMENT === 'development';

export const TOKEN_EXPIRATION = 900;

export const TOKEN_REFRESH_EXPIRATION = 86400;

export default secret;

export const ENTITIES = [User] as const;
