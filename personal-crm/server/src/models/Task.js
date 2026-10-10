import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 180 },
  description: { type: String, default: '' },
  contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', default: null },
  dueDate: { type: Date, default: null },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  status: { type: String, enum: ['Pending', 'In progress', 'Completed'], default: 'Pending' }
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);
