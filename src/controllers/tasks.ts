import asyncHandler from 'express-async-handler';
import { HttpError } from '../types/api';
import Task from '../models/task';

export const getTasks = asyncHandler(async (req, res, _next) => {
  const { user } = req;
  if (!user) {
    throw new HttpError(401, 'don"t have permissions');
  }
  const tasks = await Task.find({ createdBy: user._id });
  res.status(200).json(tasks);
});

export const createTask = asyncHandler(async (req, res, _next) => {
  const { user } = req;
  if (!user) {
    throw new HttpError(401, 'don"t have permissions');
  }
  const { body, completed } = req.body;

  const task = await Task.create({ body, completed, createdBy: user._id });
  res.status(200).json(task);
});

export const updateTask = asyncHandler(async (req, res, _next) => {
  const { id } = req.params;
  const { user } = req;
  const doc = await Task.findById(id);
  if (!doc) {
    throw new HttpError(400, 'task does not exist');
  }
  if (doc.createdBy.toString() !== user?._id.toString()) {
    throw new HttpError(401, 'don"t have permissions');
  }
  doc.body = req.body.body;
  doc.completed = req.body.completed;
  await doc.save();
  res.status(200).json(doc);
});

export const deleteTask = asyncHandler(async (req, res, _next) => {
  const { user } = req;
  const { id } = req.params;
  const task = await Task.findById(id);
  if (!task) {
    throw new HttpError(400, 'task does not exist');
  }
  if (task.createdBy.toString() !== user?._id.toString()) {
    throw new HttpError(401, 'don"t have permissions');
  }
  await task.remove();
  res.status(200).json(task);
});
