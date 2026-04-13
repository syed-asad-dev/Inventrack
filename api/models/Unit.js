import mongoose from 'mongoose';

const unitSchema = new mongoose.Schema({
  recordId: {
    type: String,
    required: true,
    unique: true
  },
  unitName: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // adds createdAt and updatedAt
});

const Unit = mongoose.models.Unit || mongoose.model('Unit', unitSchema);

export default Unit;
