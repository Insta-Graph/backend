import mongoose from 'mongoose';

const { Schema } = mongoose;

export interface ITask {
  _id: string;
  body: string;
  createdBy: string;
  completed: boolean;
}

const taskSchema = new Schema({
  body: { type: String, required: true },
  completed: { type: Boolean, required: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
});

const Task = mongoose.model<ITask>('Task', taskSchema);

export default Task;
