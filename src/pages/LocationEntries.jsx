import { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit2, Trash2, Search, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_URL || '';

const LocationEntries = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ recordId: 'Auto-generated', locationCode: '', locationName: '' });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try { setLoading(true); const res = await axios.get(`${BASE_URL}/api/locations`); setData(Array.isArray(res.data) ? res.data : []); }
    catch { toast.error('Failed to fetch locations'); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.locationCode.trim() || !formData.locationName.trim()) { toast.error('Both fields are required'); return; }
    try {
      setSaving(true);
      if (isEditing) { await axios.put(`${BASE_URL}/api/locations/${editId}`, { locationCode: formData.locationCode, locationName: formData.locationName }); toast.success('Location updated'); }
      else { await axios.post(`${BASE_URL}/api/locations`, { locationCode: formData.locationCode, locationName: formData.locationName }); toast.success('Location created'); }
      resetForm(); fetchData();
    } catch (error) { toast.error(error.response?.data?.error || 'An error occurred'); } finally { setSaving(false); }
  };

  const editItem = (item) => { setIsEditing(true); setEditId(item._id); setFormData({ recordId: item.recordId, locationCode: item.locationCode, locationName: item.locationName }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const resetForm = () => { setIsEditing(false); setEditId(null); setFormData({ recordId: 'Auto-generated', locationCode: '', locationName: '' }); };
  const confirmDelete = (item) => { setItemToDelete(item); setDeleteModalOpen(true); };

  const handleDelete = async () => {
    try { await axios.delete(`${BASE_URL}/api/locations/${itemToDelete._id}`); toast.success('Location deleted'); fetchData(); }
    catch (error) { toast.error(error.response?.data?.error || 'Failed to delete'); }
    finally { setDeleteModalOpen(false); setItemToDelete(null); if (isEditing && editId === itemToDelete?._id) resetForm(); }
  };

  const filtered = data.filter(d => d.locationCode.toLowerCase().includes(searchTerm.toLowerCase()) || d.locationName.toLowerCase().includes(searchTerm.toLowerCase()) || d.recordId.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wide">{isEditing ? 'EDIT LOCATION' : 'LOCATION ENTRY'}</h2>
          {isEditing && <button onClick={resetForm} className="text-sm text-gray-500 hover:text-gray-700 font-medium">Cancel Edit</button>}
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Record ID</label><input type="text" value={formData.recordId} readOnly className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Location Code <span className="text-red-500">*</span></label><input type="text" value={formData.locationCode} onChange={(e) => setFormData({...formData, locationCode: e.target.value.toUpperCase()})} placeholder="e.g. WH-01" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Location Name <span className="text-red-500">*</span></label><input type="text" value={formData.locationName} onChange={(e) => setFormData({...formData, locationName: e.target.value})} placeholder="e.g. Main Warehouse" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
          </div>
          <div className="flex justify-end"><button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg flex items-center gap-2 min-w-[120px] justify-center disabled:opacity-70">{saving ? <Loader2 size={18} className="animate-spin" /> : null}{saving ? 'Saving...' : (isEditing ? 'Update' : 'Save')}</button></div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="text-lg font-bold text-gray-800">Locations List</h3>
          <div className="relative"><input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full sm:w-64" /><Search className="absolute left-3 top-2.5 text-gray-400" size={18} /></div>
        </div>
        <div className="overflow-x-auto">
          {loading ? <div className="flex justify-center p-12 text-blue-600"><Loader2 size={40} className="animate-spin" /></div> : filtered.length > 0 ? (
            <table className="w-full text-left"><thead><tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider"><th className="px-6 py-4 font-semibold">ID</th><th className="px-6 py-4 font-semibold">Code</th><th className="px-6 py-4 font-semibold">Name</th><th className="px-6 py-4 font-semibold text-right">Actions</th></tr></thead>
              <tbody className="divide-y divide-gray-100">{filtered.map(item => (
                <tr key={item._id} className="hover:bg-gray-50/50"><td className="px-6 py-4 text-sm text-gray-600 font-medium">{item.recordId}</td><td className="px-6 py-4 text-sm font-bold text-gray-800">{item.locationCode}</td><td className="px-6 py-4 text-sm text-gray-700">{item.locationName}</td>
                  <td className="px-6 py-4 text-right"><div className="flex items-center justify-end gap-3"><button onClick={() => editItem(item)} className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"><Edit2 size={16} /></button><button onClick={() => confirmDelete(item)} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100"><Trash2 size={16} /></button></div></td></tr>
              ))}</tbody></table>
          ) : <div className="p-12 text-center text-gray-500">{searchTerm ? 'No match.' : 'No locations found.'}</div>}
        </div>
      </div>

      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"><div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-4 mx-auto"><Trash2 size={24} /></div>
          <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Delete Location</h3>
          <p className="text-center text-gray-500 mb-6">Delete <span className="font-bold text-gray-800">{itemToDelete?.recordId} ({itemToDelete?.locationCode})</span>?</p>
          <div className="flex gap-4"><button onClick={() => setDeleteModalOpen(false)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg">Cancel</button><button onClick={handleDelete} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg">Delete</button></div>
        </div></div>
      )}
    </div>
  );
};

export default LocationEntries;
