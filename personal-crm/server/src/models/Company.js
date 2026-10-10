import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 140 },
  website: { type: String, trim: true, default: '' },
  industry: { type: String, trim: true, default: '' },
  location: { type: String, trim: true, default: '' },
  notes: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('Company', companySchema);
