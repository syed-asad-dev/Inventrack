import { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit2, Trash2, Search, Loader2, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_URL || '';

const UserAccess = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ username: '', password: '', role: 'Viewer' });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try { setLoading(true); const res = await axios.get(`${BASE_URL}/api/users`); setData(Array.isArray(res.data) ? res.data : []); }
    catch { toast.error('Failed to fetch users'); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username.trim()) { toast.error('Username is required'); return; }
    if (!isEditing && !formData.password.trim()) { toast.error('Password is required'); return; }
    try {
      setSaving(true);
      if (isEditing) {
        const payload = { role: formData.role };
        if (formData.password) payload.password = formData.password;
        await axios.put(`${BASE_URL}/api/users/${editId}`, payload);
        toast.success('User updated');
      } else {
        await axios.post(`${BASE_URL}/api/users`, formData);
        toast.success('User created');
      }
      resetForm(); fetchData();
    } catch (error) { toast.error(error.response?.data?.error || 'An error occurred'); } finally { setSaving(false); }
  };

  const editItem = (item) => { setIsEditing(true); setEditId(item._id); setFormData({ username: item.username, password: '', role: item.role }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const resetForm = () => { setIsEditing(false); setEditId(null); setFormData({ username: '', password: '', role: 'Viewer' }); };
  const confirmDelete = (item) => { setItemToDelete(item); setDeleteModalOpen(true); };

  const handleDelete = async () => {
    try { await axios.delete(`${BASE_URL}/api/users/${itemToDelete._id}`); toast.success('User deleted'); fetchData(); }
    catch (error) { toast.error(error.response?.data?.error || 'Failed to delete'); }
    finally { setDeleteModalOpen(false); setItemToDelete(null); if (isEditing && editId === itemToDelete?._id) resetForm(); }
  };

  const filtered = data.filter(d => d.username?.toLowerCase().includes(searchTerm.toLowerCase()) || d.userId?.toLowerCase().includes(searchTerm.toLowerCase()));

  const roleBadge = (role) => {
    const colors = { Admin: 'bg-red-100 text-red-700', Manager: 'bg-blue-100 text-blue-700', Viewer: 'bg-gray-100 text-gray-700' };
    return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${colors[role] || colors.Viewer}`}>{role}</span>;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2"><Shield size={20} /> {isEditing ? 'EDIT USER' : 'USER ACCESS'}</h2>
          {isEditing && <button onClick={resetForm} className="text-sm text-gray-500 hover:text-gray-700 font-medium">Cancel Edit</button>}
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Username <span className="text-red-500">*</span></label><input type="text" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} placeholder="e.g. john_doe" required disabled={isEditing} className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">{isEditing ? 'New Password (optional)' : 'Password'} {!isEditing && <span className="text-red-500">*</span>}</label><input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder={isEditing ? 'Leave blank to keep' : 'Enter password'} required={!isEditing} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Role <span className="text-red-500">*</span></label>
              <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="Admin">Admin</option><option value="Manager">Manager</option><option value="Viewer">Viewer</option>
              </select></div>
          </div>
          <div className="flex justify-end"><button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg flex items-center gap-2 min-w-[120px] justify-center disabled:opacity-70">{saving ? <Loader2 size={18} className="animate-spin" /> : null}{saving ? 'Saving...' : (isEditing ? 'Update' : 'Create User')}</button></div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="text-lg font-bold text-gray-800">Users List</h3>
          <div className="relative"><input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full sm:w-64" /><Search className="absolute left-3 top-2.5 text-gray-400" size={18} /></div>
        </div>
        <div className="overflow-x-auto">
          {loading ? <div className="flex justify-center p-12 text-blue-600"><Loader2 size={40} className="animate-spin" /></div> : filtered.length > 0 ? (
            <table className="w-full text-left"><thead><tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">ID</th><th className="px-6 py-4 font-semibold">Username</th><th className="px-6 py-4 font-semibold">Role</th><th className="px-6 py-4 font-semibold">Status</th><th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr></thead>
              <tbody className="divide-y divide-gray-100">{filtered.map(item => (
                <tr key={item._id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">{item.userId}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-800">{item.username}</td>
                  <td className="px-6 py-4">{roleBadge(item.role)}</td>
                  <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{item.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td className="px-6 py-4 text-right"><div className="flex items-center justify-end gap-3">
                    <button onClick={() => editItem(item)} className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"><Edit2 size={16} /></button>
                    <button onClick={() => confirmDelete(item)} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100"><Trash2 size={16} /></button>
                  </div></td>
                </tr>
              ))}</tbody></table>
          ) : <div className="p-12 text-center text-gray-500">{searchTerm ? 'No match.' : 'No users found.'}</div>}
        </div>
      </div>

      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"><div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-4 mx-auto"><Trash2 size={24} /></div>
          <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Delete User</h3>
          <p className="text-center text-gray-500 mb-6">Delete <span className="font-bold text-gray-800">{itemToDelete?.username}</span>?</p>
          <div className="flex gap-4"><button onClick={() => setDeleteModalOpen(false)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg">Cancel</button><button onClick={handleDelete} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg">Delete</button></div>
        </div></div>
      )}
    </div>
  );
};

export default UserAccess;
