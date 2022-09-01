import dotenv from 'dotenv';

dotenv.config();

const secret = process.env.JWT_SECRET || 'jsvknakln';

export const ENVIRONMENT = process.env.ENVIRONMENT ?? false;

export const IS_DEVELOPMENT_ENV = ENVIRONMENT && ENVIRONMENT === 'development';

export const TOKEN_EXPIRATION = 3600;

export const TOKEN_REFRESH_EXPIRATION = 86400;

export default secret;
