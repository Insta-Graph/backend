import express from 'express';
import { registerSchema, tokenSchema, loginSchema } from '../types/validationSchemas';
import authMiddleware from '../middleware/auth';
import bodyMiddleware from '../middleware/body';

// eslint-disable-next-line prettier/prettier
import {
  register,
  login,
  refreshTokenHandler,
  logout
} from '../controllers/auth';

const router = express.Router();

router.post('/register', bodyMiddleware(registerSchema), register);
router.post('/login', bodyMiddleware(loginSchema), login);
router.post('/refresh-token', bodyMiddleware(tokenSchema), refreshTokenHandler);
router.post('/logout', authMiddleware, bodyMiddleware(tokenSchema), logout);

export default router;
