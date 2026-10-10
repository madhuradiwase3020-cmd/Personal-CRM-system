import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 180 },
  content: { type: String, default: '' },
  contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', default: null },
  color: { type: String, enum: ['violet', 'blue', 'green', 'amber'], default: 'violet' }
}, { timestamps: true });

export default mongoose.model('Note', noteSchema);
