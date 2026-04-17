import connectToDatabase from '../utils/db.js';
import StockTransfer from '../models/StockTransfer.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  try {
    await connectToDatabase();

    if (req.method === 'GET') {
      const docs = await StockTransfer.find({}).populate('fromLocation', 'locationName locationCode').populate('toLocation', 'locationName locationCode').populate('itemName', 'itemName recordId').sort({ createdAt: -1 });
      return res.status(200).json(docs);
    }

    if (req.method === 'POST') {
      const { transferDate, fromLocation, toLocation, itemName, qtyTransferred, remarks } = req.body;
      if (!fromLocation || !toLocation || !itemName || !qtyTransferred) {
        return res.status(400).json({ error: 'From, to locations, item, and quantity are required' });
      }
      if (fromLocation === toLocation) {
        return res.status(400).json({ error: 'From and To locations must be different' });
      }

      const last = await StockTransfer.findOne().sort({ transferNo: -1 });
      let nextNum = 1;
      if (last?.transferNo?.startsWith('TRF-')) {
        const n = parseInt(last.transferNo.split('-')[1]);
        if (!isNaN(n)) nextNum = n + 1;
      }
      const transferNo = `TRF-${nextNum.toString().padStart(3, '0')}`;

      const doc = new StockTransfer({ transferNo, transferDate: transferDate || new Date(), fromLocation, toLocation, itemName, qtyTransferred, remarks });
      await doc.save();
      const populated = await StockTransfer.findById(doc._id).populate('fromLocation', 'locationName locationCode').populate('toLocation', 'locationName locationCode').populate('itemName', 'itemName recordId');
      return res.status(201).json(populated);
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
