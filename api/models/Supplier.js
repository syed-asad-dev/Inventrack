import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
  recordId: { type: String, required: true, unique: true },
  supplierName: { type: String, required: true, unique: true },
}, { timestamps: true });

const Supplier = mongoose.models.Supplier || mongoose.model('Supplier', supplierSchema);
export default Supplier;
