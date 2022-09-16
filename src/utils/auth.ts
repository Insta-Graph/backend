import jwt from 'jsonwebtoken';
import {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  TOKEN_EXPIRATION,
  TOKEN_REFRESH_EXPIRATION,
} from '../constants';

export const generateAccessToken = (userId: string) =>
  jwt.sign({ id: userId }, ACCESS_TOKEN_SECRET, { expiresIn: TOKEN_EXPIRATION });

export const generateRefreshToken = (userId: string) =>
  jwt.sign({ id: userId }, REFRESH_TOKEN_SECRET, {
    expiresIn: TOKEN_REFRESH_EXPIRATION,
  });

export const generateTokens = (userId: string) => ({
  accessToken: generateAccessToken(userId),
  refreshToken: generateRefreshToken(userId),
  expiresIn: TOKEN_EXPIRATION,
});
