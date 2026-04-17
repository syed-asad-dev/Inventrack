import connectToDatabase from '../utils/db.js';
import StockOut from '../models/StockOut.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  try {
    await connectToDatabase();

    if (req.method === 'GET') {
      const docs = await StockOut.find({}).populate('itemName', 'itemName recordId').populate('location', 'locationName locationCode').sort({ createdAt: -1 });
      return res.status(200).json(docs);
    }

    if (req.method === 'POST') {
      const { issueDate, department, itemName, qtyIssued, location, remarks } = req.body;
      if (!department || !itemName || !qtyIssued || !location) {
        return res.status(400).json({ error: 'Department, item, quantity, and location are required' });
      }

      const last = await StockOut.findOne().sort({ issueNo: -1 });
      let nextNum = 1;
      if (last?.issueNo?.startsWith('ISS-')) {
        const n = parseInt(last.issueNo.split('-')[1]);
        if (!isNaN(n)) nextNum = n + 1;
      }
      const issueNo = `ISS-${nextNum.toString().padStart(3, '0')}`;

      const doc = new StockOut({ issueNo, issueDate: issueDate || new Date(), department, itemName, qtyIssued, location, remarks });
      await doc.save();
      const populated = await StockOut.findById(doc._id).populate('itemName', 'itemName recordId').populate('location', 'locationName locationCode');
      return res.status(201).json(populated);
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
