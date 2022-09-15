import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import secret, { TOKEN_EXPIRATION } from '../constants';

// eslint-disable-next-line import/prefer-default-export
export const generateTokens = (userId: string) => {
  const expiration = { expiresIn: TOKEN_EXPIRATION };
  const accessToken = jwt.sign({ id: userId }, secret, { ...expiration });
  const refreshToken = crypto.randomBytes(40).toString('hex');
  return { accessToken, refreshToken, expiresIn: expiration.expiresIn };
};
