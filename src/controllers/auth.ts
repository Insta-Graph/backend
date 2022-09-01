import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { HttpError } from '../types/api';
import secret, { TOKEN_EXPIRATION, TOKEN_REFRESH_EXPIRATION } from '../constants';
import User from '../models/user';
import RefreshToken from '../models/refreshToken';

const generateTokens = (userId: string) => {
  const accessToken = jwt.sign({ id: userId }, secret, { expiresIn: TOKEN_EXPIRATION });
  const refreshToken = crypto.randomBytes(40).toString('hex');
  return { accessToken, refreshToken };
};

export const register = asyncHandler(async (req, res, _next) => {
  const { email, fullName, password } = req.body;
  if (!email || !fullName || !password) {
    throw new HttpError(400, 'Bad data');
  }
  const user = await User.findOne({ email });
  if (user) {
    throw new HttpError(400, 'User already exists');
  }
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);
  const newUser = await User.create({ email, fullName, password: hashedPassword });

  if (newUser) {
    const { accessToken, refreshToken } = generateTokens(newUser._id);
    // save refresh token
    RefreshToken.create({
      user: newUser._id,
      token: refreshToken,
      expires: Date.now() + TOKEN_REFRESH_EXPIRATION * 1000,
    });

    res.status(201).json({
      email: newUser.email,
      id: newUser._id,
      fullName: newUser.fullName,
      accessToken,
      refreshToken,
    });
  }
  throw new HttpError(400, 'invalid user data');
});

export const login = asyncHandler(async (req, res, _next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new HttpError(400, 'User does not exist');
  }

  const isPasswordValid = bcrypt.compareSync(password, user.password);

  if (!isPasswordValid) {
    throw new HttpError(400, 'Invalid password');
  }
  const { accessToken, refreshToken } = generateTokens(user._id);

  // save refresh token
  RefreshToken.create({
    user: user._id,
    token: refreshToken,
    expires: Date.now() + TOKEN_REFRESH_EXPIRATION * 1000,
  });

  res.status(200).json({
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    accessToken,
    refreshToken,
  });
});

export const refreshTokenHandler = asyncHandler(async (req, res, _next) => {
  const {
    body: { token },
  } = req;

  if (!token) {
    throw new HttpError(400, 'send a token');
  }

  const refresh = await RefreshToken.findOne({ token });

  if (!refresh) {
    throw new HttpError(400, 'token does not exist');
  }
  if (refresh.isExpired) {
    throw new HttpError(403, 'Refresh token was expired. Please make a new login request');
  }

  const { accessToken, refreshToken } = generateTokens(refresh.user.toString());
  // save refresh token
  RefreshToken.create({
    user: refresh.user.toString(),
    token: refreshToken,
    expires: Date.now() + TOKEN_REFRESH_EXPIRATION * 1000,
  });
  // remove old token
  await refresh.remove();
  res.status(200).json({
    accessToken,
    refreshToken,
  });
});

export const logout = asyncHandler(async (req, res, _next) => {
  const { token } = req.body;
  const refresh = await RefreshToken.findOne({ token });
  if (!refresh) {
    throw new HttpError(400, 'token does not exist');
  }
  await refresh.remove();
  res.status(200).json({ message: 'logged out' });
});
