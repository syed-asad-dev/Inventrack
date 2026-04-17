import connectToDatabase from '../utils/db.js';
import Location from '../models/Location.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const { id } = req.query;
  try {
    await connectToDatabase();

    if (req.method === 'PUT') {
      const { locationCode, locationName } = req.body;
      if (!locationCode || !locationName) return res.status(400).json({ error: 'Location code and name are required' });
      const doc = await Location.findByIdAndUpdate(id, { locationCode: locationCode.toUpperCase(), locationName }, { new: true, runValidators: true });
      if (!doc) return res.status(404).json({ error: 'Location not found' });
      return res.status(200).json(doc);
    }

    if (req.method === 'DELETE') {
      const doc = await Location.findByIdAndDelete(id);
      if (!doc) return res.status(404).json({ error: 'Location not found' });
      return res.status(200).json({ message: 'Location deleted successfully', id });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ error: 'Location code already exists' });
    return res.status(500).json({ error: error.message });
  }
}
