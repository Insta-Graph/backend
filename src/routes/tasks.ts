import express from 'express';
import { taskSchema } from '../types/validationSchemas';
import authMiddleware from '../middleware/auth';
import bodyMiddleware from '../middleware/body';
// eslint-disable-next-line object-curly-newline
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/tasks';

const router = express.Router();

router.use(authMiddleware);

router.route('/').get(getTasks).post(bodyMiddleware(taskSchema), createTask);
router.route('/:id').delete(deleteTask).put(bodyMiddleware(taskSchema), updateTask);

export default router;
