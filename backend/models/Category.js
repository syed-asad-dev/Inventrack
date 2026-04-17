import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  recordId: { type: String, required: true, unique: true },
  categoryName: { type: String, required: true, unique: true, uppercase: true },
}, { timestamps: true });

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
export default Category;
