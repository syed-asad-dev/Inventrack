import connectToDatabase from '../utils/db.js';
import Item from '../models/Item.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  try {
    await connectToDatabase();

    if (req.method === 'GET') {
      const items = await Item.find({}).populate('category', 'categoryName').populate('unit', 'unitName').sort({ createdAt: -1 });
      return res.status(200).json(items);
    }

    if (req.method === 'POST') {
      const { itemName, category, unit, minimumStockLevel, description } = req.body;
      if (!itemName || !category || !unit || minimumStockLevel === undefined) {
        return res.status(400).json({ error: 'Item name, category, unit, and minimum stock level are required' });
      }

      const last = await Item.findOne().sort({ recordId: -1 });
      let nextNum = 1;
      if (last?.recordId?.startsWith('ITM-')) {
        const n = parseInt(last.recordId.split('-')[1]);
        if (!isNaN(n)) nextNum = n + 1;
      }
      const recordId = `ITM-${nextNum.toString().padStart(2, '0')}`;

      const doc = new Item({ recordId, itemName, category, unit, minimumStockLevel, description });
      await doc.save();
      const populated = await Item.findById(doc._id).populate('category', 'categoryName').populate('unit', 'unitName');
      return res.status(201).json(populated);
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ error: 'Item name already exists' });
    return res.status(500).json({ error: error.message });
  }
}
