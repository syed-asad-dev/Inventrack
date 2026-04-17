import connectToDatabase from '../utils/db.js';
import Category from '../models/Category.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  try {
    await connectToDatabase();

    if (req.method === 'GET') {
      const categories = await Category.find({}).sort({ createdAt: -1 });
      return res.status(200).json(categories);
    }

    if (req.method === 'POST') {
      const { categoryName } = req.body;
      if (!categoryName) return res.status(400).json({ error: 'Category name is required' });

      const last = await Category.findOne().sort({ recordId: -1 });
      let nextNum = 1;
      if (last?.recordId?.startsWith('CAT-')) {
        const n = parseInt(last.recordId.split('-')[1]);
        if (!isNaN(n)) nextNum = n + 1;
      }
      const recordId = `CAT-${nextNum.toString().padStart(2, '0')}`;

      const doc = new Category({ recordId, categoryName: categoryName.toUpperCase() });
      await doc.save();
      return res.status(201).json(doc);
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ error: 'Category name already exists' });
    return res.status(500).json({ error: error.message });
  }
}
