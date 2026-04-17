import connectToDatabase from '../utils/db.js';
import User from '../models/User.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const { id } = req.query;
  try {
    await connectToDatabase();

    if (req.method === 'PUT') {
      const { role, password } = req.body;
      const update = {};
      if (role) update.role = role;
      if (password) update.password = password;
      const doc = await User.findByIdAndUpdate(id, update, { new: true }).select('-password');
      if (!doc) return res.status(404).json({ error: 'User not found' });
      return res.status(200).json(doc);
    }

    if (req.method === 'DELETE') {
      const doc = await User.findByIdAndDelete(id);
      if (!doc) return res.status(404).json({ error: 'User not found' });
      return res.status(200).json({ message: 'User deleted successfully', id });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
