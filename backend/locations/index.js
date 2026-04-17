import connectToDatabase from '../utils/db.js';
import Location from '../models/Location.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  try {
    await connectToDatabase();

    if (req.method === 'GET') {
      const locations = await Location.find({}).sort({ createdAt: -1 });
      return res.status(200).json(locations);
    }

    if (req.method === 'POST') {
      const { locationCode, locationName } = req.body;
      if (!locationCode || !locationName) return res.status(400).json({ error: 'Location code and name are required' });

      const last = await Location.findOne().sort({ recordId: -1 });
      let nextNum = 1;
      if (last?.recordId?.startsWith('LOC-')) {
        const n = parseInt(last.recordId.split('-')[1]);
        if (!isNaN(n)) nextNum = n + 1;
      }
      const recordId = `LOC-${nextNum.toString().padStart(2, '0')}`;

      const doc = new Location({ recordId, locationCode: locationCode.toUpperCase(), locationName });
      await doc.save();
      return res.status(201).json(doc);
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ error: 'Location code already exists' });
    return res.status(500).json({ error: error.message });
  }
}
