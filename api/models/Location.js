import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  recordId: { type: String, required: true, unique: true },
  locationCode: { type: String, required: true, unique: true, uppercase: true },
  locationName: { type: String, required: true },
}, { timestamps: true });

const Location = mongoose.models.Location || mongoose.model('Location', locationSchema);
export default Location;
