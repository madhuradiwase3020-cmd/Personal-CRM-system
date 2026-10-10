import mongoose from 'mongoose';

const interactionSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', required: true },
  type: { type: String, enum: ['Call', 'Meeting', 'Email', 'Message', 'Event', 'Other'], default: 'Meeting' },
  date: { type: Date, default: Date.now },
  summary: { type: String, required: true, trim: true, maxlength: 2000 },
  nextFollowUp: { type: Date, default: null }
}, { timestamps: true });

export default mongoose.model('Interaction', interactionSchema);
