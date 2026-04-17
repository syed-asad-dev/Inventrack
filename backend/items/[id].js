import connectToDatabase from '../utils/db.js';
import Item from '../models/Item.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const { id } = req.query;
  try {
    await connectToDatabase();

    if (req.method === 'PUT') {
      const { itemName, category, unit, minimumStockLevel, description } = req.body;
      if (!itemName) return res.status(400).json({ error: 'Item name is required' });
      const doc = await Item.findByIdAndUpdate(id, { itemName, category, unit, minimumStockLevel, description }, { new: true, runValidators: true }).populate('category', 'categoryName').populate('unit', 'unitName');
      if (!doc) return res.status(404).json({ error: 'Item not found' });
      return res.status(200).json(doc);
    }

    if (req.method === 'DELETE') {
      const doc = await Item.findByIdAndDelete(id);
      if (!doc) return res.status(404).json({ error: 'Item not found' });
      return res.status(200).json({ message: 'Item deleted successfully', id });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ error: 'Item name already exists' });
    return res.status(500).json({ error: error.message });
  }
}
