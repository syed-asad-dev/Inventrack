import mongoose from 'mongoose';

const stockTransferSchema = new mongoose.Schema({
  transferNo: { type: String, required: true, unique: true },
  transferDate: { type: Date, required: true, default: Date.now },
  fromLocation: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  toLocation: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  itemName: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  qtyTransferred: { type: Number, required: true, min: 1 },
  remarks: { type: String, default: '' },
}, { timestamps: true });

const StockTransfer = mongoose.models.StockTransfer || mongoose.model('StockTransfer', stockTransferSchema);
export default StockTransfer;
