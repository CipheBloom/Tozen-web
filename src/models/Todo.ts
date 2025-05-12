import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
  date: { type: Date, default: Date.now },
  userId: { type: String, required: true } // We'll add user authentication later
});

export default mongoose.models.Todo || mongoose.model('Todo', todoSchema);
