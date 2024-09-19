// models/Task.js
import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  name: String,
  status: String,
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' }
});

export default mongoose.models.Task || mongoose.model('Task', TaskSchema);
