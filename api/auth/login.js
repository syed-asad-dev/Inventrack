import connectToDatabase from '../../utils/db.js';
import User from '../../models/User.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    await connectToDatabase();
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });

    // Seed default admin if no users exist
    const count = await User.countDocuments({});
    if (count === 0) {
      await new User({ userId: 'USR-01', username: 'admin', password: 'Admin@123', role: 'Admin' }).save();
    }

    const user = await User.findOne({ username, isActive: true });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (user.password !== password) return res.status(401).json({ error: 'Invalid credentials' });

    // Simple token (in production use JWT)
    const token = Buffer.from(JSON.stringify({ id: user._id, username: user.username, role: user.role })).toString('base64');

    return res.status(200).json({ token, user: { _id: user._id, userId: user.userId, username: user.username, role: user.role } });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
