import mongoose from 'mongoose';

const stockOutSchema = new mongoose.Schema({
  issueNo: { type: String, required: true, unique: true },
  issueDate: { type: Date, required: true, default: Date.now },
  department: { type: String, required: true, enum: ['Production', 'Sales'] },
  itemName: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  qtyIssued: { type: Number, required: true, min: 1 },
  location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  remarks: { type: String, default: '' },
}, { timestamps: true });

const StockOut = mongoose.models.StockOut || mongoose.model('StockOut', stockOutSchema);
export default StockOut;
