import * as yup from 'yup';

export const taskSchema = yup.object({
  body: yup.string().min(1).required(),
  completed: yup.boolean().required(),
});

export const loginSchema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().min(8).required(),
});

export const registerSchema = loginSchema.shape({
  fullName: yup.string().min(1).required(),
});

export const tokenSchema = yup.object({
  token: yup.string().length(80, 'Invalid token').required(),
});
