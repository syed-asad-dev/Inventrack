import connectToDatabase from '../utils/db.js';
import StockOut from '../models/StockOut.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const { id } = req.query;
  try {
    await connectToDatabase();

    if (req.method === 'DELETE') {
      const doc = await StockOut.findByIdAndDelete(id);
      if (!doc) return res.status(404).json({ error: 'Issue record not found' });
      return res.status(200).json({ message: 'Issue deleted successfully', id });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
