import connectToDatabase from '../utils/db.js';
import StockIn from '../models/StockIn.js';
import StockOut from '../models/StockOut.js';
import StockTransfer from '../models/StockTransfer.js';
import Item from '../models/Item.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    await connectToDatabase();
    const { type, itemId, categoryId, locationId, supplierId, startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) { const ed = new Date(endDate); ed.setHours(23,59,59,999); dateFilter.$lte = ed; }

    if (type === 'stock') {
      // Current stock per item
      const items = await Item.find({}).populate('category', 'categoryName').populate('unit', 'unitName').lean();
      const result = [];
      for (const item of items) {
        if (categoryId && item.category?._id?.toString() !== categoryId) continue;
        const inAgg = await StockIn.aggregate([{ $match: { itemName: item._id } }, { $group: { _id: null, total: { $sum: '$qtyReceived' } } }]);
        const outAgg = await StockOut.aggregate([{ $match: { itemName: item._id } }, { $group: { _id: null, total: { $sum: '$qtyIssued' } } }]);
        const currentStock = (inAgg[0]?.total || 0) - (outAgg[0]?.total || 0);
        result.push({
          itemName: item.itemName,
          category: item.category?.categoryName || 'N/A',
          unit: item.unit?.unitName || 'N/A',
          currentStock,
          minStock: item.minimumStockLevel,
          status: currentStock <= item.minimumStockLevel ? 'Low' : 'OK',
        });
      }
      return res.status(200).json(result);
    }

    if (type === 'ledger') {
      if (!itemId) return res.status(400).json({ error: 'Item ID is required for ledger report' });
      const mongoose = await import('mongoose');
      const itemObjId = new mongoose.default.Types.ObjectId(itemId);
      const inFilter = { itemName: itemObjId };
      const outFilter = { itemName: itemObjId };
      const trfFilter = { itemName: itemObjId };
      if (Object.keys(dateFilter).length) { inFilter.createdAt = dateFilter; outFilter.createdAt = dateFilter; trfFilter.createdAt = dateFilter; }

      const ins = await StockIn.find(inFilter).sort({ createdAt: 1 }).lean();
      const outs = await StockOut.find(outFilter).sort({ createdAt: 1 }).lean();
      const trfs = await StockTransfer.find(trfFilter).sort({ createdAt: 1 }).lean();

      const ledger = [
        ...ins.map(r => ({ date: r.createdAt, type: 'IN', ref: r.grnNo, qtyIn: r.qtyReceived, qtyOut: 0 })),
        ...outs.map(r => ({ date: r.createdAt, type: 'OUT', ref: r.issueNo, qtyIn: 0, qtyOut: r.qtyIssued })),
        ...trfs.map(r => ({ date: r.createdAt, type: 'TRANSFER', ref: r.transferNo, qtyIn: 0, qtyOut: r.qtyTransferred })),
      ].sort((a, b) => new Date(a.date) - new Date(b.date));

      let balance = 0;
      ledger.forEach(l => { balance += l.qtyIn - l.qtyOut; l.balance = balance; });
      return res.status(200).json(ledger);
    }

    if (type === 'stockin') {
      const filter = {};
      if (Object.keys(dateFilter).length) filter.createdAt = dateFilter;
      if (itemId) { const mongoose = await import('mongoose'); filter.itemName = new mongoose.default.Types.ObjectId(itemId); }
      if (supplierId) filter.supplierName = supplierId;
      const docs = await StockIn.find(filter).populate('itemName', 'itemName').populate('location', 'locationName').sort({ createdAt: -1 }).lean();
      return res.status(200).json(docs.map(d => ({
        grnNo: d.grnNo, date: d.grnDate, supplier: d.supplierName, item: d.itemName?.itemName || 'N/A', qty: d.qtyReceived, location: d.location?.locationName || 'N/A'
      })));
    }

    if (type === 'stockout') {
      const filter = {};
      if (Object.keys(dateFilter).length) filter.createdAt = dateFilter;
      if (itemId) { const mongoose = await import('mongoose'); filter.itemName = new mongoose.default.Types.ObjectId(itemId); }
      const docs = await StockOut.find(filter).populate('itemName', 'itemName').populate('location', 'locationName').sort({ createdAt: -1 }).lean();
      return res.status(200).json(docs.map(d => ({
        issueNo: d.issueNo, date: d.issueDate, department: d.department, item: d.itemName?.itemName || 'N/A', qty: d.qtyIssued, location: d.location?.locationName || 'N/A'
      })));
    }

    return res.status(400).json({ error: 'Invalid report type. Use: stock, ledger, stockin, stockout' });
  } catch (error) {
    console.error('Reports API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
