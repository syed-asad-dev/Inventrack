import connectToDatabase from '../utils/db.js';
import StockIn from '../models/StockIn.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  try {
    await connectToDatabase();

    if (req.method === 'GET') {
      const docs = await StockIn.find({}).populate('itemName', 'itemName recordId').populate('location', 'locationName locationCode').sort({ createdAt: -1 });
      return res.status(200).json(docs);
    }

    if (req.method === 'POST') {
      const { grnDate, supplierName, purchaseOrderRef, itemName, qtyReceived, location, remarks } = req.body;
      if (!supplierName || !itemName || !qtyReceived || !location) {
        return res.status(400).json({ error: 'Supplier, item, quantity, and location are required' });
      }

      const last = await StockIn.findOne().sort({ grnNo: -1 });
      let nextNum = 1;
      if (last?.grnNo?.startsWith('GRN-')) {
        const n = parseInt(last.grnNo.split('-')[1]);
        if (!isNaN(n)) nextNum = n + 1;
      }
      const grnNo = `GRN-${nextNum.toString().padStart(3, '0')}`;

      const doc = new StockIn({ grnNo, grnDate: grnDate || new Date(), supplierName, purchaseOrderRef, itemName, qtyReceived, location, remarks });
      await doc.save();
      const populated = await StockIn.findById(doc._id).populate('itemName', 'itemName recordId').populate('location', 'locationName locationCode');
      return res.status(201).json(populated);
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
