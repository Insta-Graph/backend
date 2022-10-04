import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

export const ACCESS_TOKEN_SECRET =
  process.env.JWT_ACCESS_SECRET || crypto.randomBytes(20).toString('hex');

export const REFRESH_TOKEN_SECRET =
  process.env.JWT_REFRESH_SECRET || crypto.randomBytes(20).toString('hex');

export const ENVIRONMENT = process.env.ENVIRONMENT ?? false;

export const IS_DEVELOPMENT_ENV = ENVIRONMENT && ENVIRONMENT === 'development';

export const FRONTEND_URL = IS_DEVELOPMENT_ENV ? 'http://localhost:3002' : process.env.FRONTEND_URL;

export const SOURCE_EMAIL_ADDRESS = process.env.SOURCE_EMAIL_ADDRESS ?? 'app.snapify@gmail.com';

export const TOKEN_EXPIRATION = 900;

export const TOKEN_REFRESH_EXPIRATION = 86400;

export const TOKEN_RESET_EXPIRATION = 300;

export const EMAIL_TEMPLATES = {
  forgotPassword: {
    templateName: 'ForgotPasswordTemplate',
    formatTemplateData: (redirectUrl: string) =>
      `{ "url":"${redirectUrl}", "frontend_url": "${FRONTEND_URL}" }`,
  },
};
