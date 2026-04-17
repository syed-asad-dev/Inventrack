import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  recordId: { type: String, required: true, unique: true },
  itemName: { type: String, required: true, unique: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
  minimumStockLevel: { type: Number, required: true, default: 0 },
  description: { type: String, default: '' },
}, { timestamps: true });

const Item = mongoose.models.Item || mongoose.model('Item', itemSchema);
export default Item;
