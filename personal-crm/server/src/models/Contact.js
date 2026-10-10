import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, trim: true, lowercase: true, default: '' },
  phone: { type: String, trim: true, default: '' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', default: null },
  jobTitle: { type: String, trim: true, default: '' },
  location: { type: String, trim: true, default: '' },
  birthday: { type: Date, default: null },
  website: { type: String, trim: true, default: '' },
  relationshipType: { type: String, enum: ['Friend', 'Family', 'College', 'HR / Recruiter', 'Client', 'Customer', 'Colleague', 'Professional', 'Other'], default: 'Professional' },
  tags: [{ type: String, trim: true }],
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Contact', contactSchema);
