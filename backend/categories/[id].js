import connectToDatabase from '../utils/db.js';
import Category from '../models/Category.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const { id } = req.query;
  try {
    await connectToDatabase();

    if (req.method === 'PUT') {
      const { categoryName } = req.body;
      if (!categoryName) return res.status(400).json({ error: 'Category name is required' });
      const doc = await Category.findByIdAndUpdate(id, { categoryName: categoryName.toUpperCase() }, { new: true, runValidators: true });
      if (!doc) return res.status(404).json({ error: 'Category not found' });
      return res.status(200).json(doc);
    }

    if (req.method === 'DELETE') {
      const doc = await Category.findByIdAndDelete(id);
      if (!doc) return res.status(404).json({ error: 'Category not found' });
      return res.status(200).json({ message: 'Category deleted successfully', id });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ error: 'Category name already exists' });
    return res.status(500).json({ error: error.message });
  }
}
