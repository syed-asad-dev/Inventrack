import mongoose from 'mongoose';

const stockInSchema = new mongoose.Schema({
  grnNo: { type: String, required: true, unique: true },
  grnDate: { type: Date, required: true, default: Date.now },
  supplierName: { type: String, required: true },
  purchaseOrderRef: { type: String, default: '' },
  itemName: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  qtyReceived: { type: Number, required: true, min: 1 },
  location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  remarks: { type: String, default: '' },
}, { timestamps: true });

const StockIn = mongoose.models.StockIn || mongoose.model('StockIn', stockInSchema);
export default StockIn;
