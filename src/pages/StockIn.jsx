import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Search, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_URL || '';

const StockIn = () => {
  const [data, setData] = useState([]);
  const [items, setItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ grnDate: new Date().toISOString().split('T')[0], supplierName: '', purchaseOrderRef: '', itemName: '', qtyReceived: '', location: '', remarks: '' });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => { fetchData(); fetchDropdowns(); }, []);

  const fetchData = async () => {
    try { setLoading(true); const res = await axios.get(`${BASE_URL}/api/stockin`); setData(Array.isArray(res.data) ? res.data : []); }
    catch { toast.error('Failed to fetch GRN records'); } finally { setLoading(false); }
  };

  const fetchDropdowns = async () => {
    try {
      const [itemRes, locRes, supRes] = await Promise.all([axios.get(`${BASE_URL}/api/items`), axios.get(`${BASE_URL}/api/locations`), axios.get(`${BASE_URL}/api/suppliers`)]);
      setItems(Array.isArray(itemRes.data) ? itemRes.data : []);
      setLocations(Array.isArray(locRes.data) ? locRes.data : []);
      setSuppliers(Array.isArray(supRes.data) ? supRes.data : []);
    } catch { /* silent */ }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.supplierName || !formData.itemName || !formData.qtyReceived || !formData.location) { toast.error('Fill all required fields'); return; }
    try {
      setSaving(true);
      await axios.post(`${BASE_URL}/api/stockin`, { ...formData, qtyReceived: Number(formData.qtyReceived) });
      toast.success('GRN saved successfully');
      setFormData({ grnDate: new Date().toISOString().split('T')[0], supplierName: '', purchaseOrderRef: '', itemName: '', qtyReceived: '', location: '', remarks: '' });
      fetchData();
    } catch (error) { toast.error(error.response?.data?.error || 'An error occurred'); } finally { setSaving(false); }
  };

  const confirmDelete = (item) => { setItemToDelete(item); setDeleteModalOpen(true); };
  const handleDelete = async () => {
    try { await axios.delete(`${BASE_URL}/api/stockin/${itemToDelete._id}`); toast.success('GRN deleted'); fetchData(); }
    catch (error) { toast.error(error.response?.data?.error || 'Failed to delete'); }
    finally { setDeleteModalOpen(false); setItemToDelete(null); }
  };

  const filtered = data.filter(d => d.grnNo?.toLowerCase().includes(searchTerm.toLowerCase()) || d.itemName?.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) || d.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100"><h2 className="text-lg font-bold text-gray-800 uppercase tracking-wide">STOCK IN - GRN</h2></div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div><label className="block text-sm font-medium text-gray-700 mb-2">GRN Date <span className="text-red-500">*</span></label><input type="date" value={formData.grnDate} onChange={(e) => setFormData({...formData, grnDate: e.target.value})} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Supplier <span className="text-red-500">*</span></label>
              <select value={formData.supplierName} onChange={(e) => setFormData({...formData, supplierName: e.target.value})} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Select Supplier</option><option value="In House Production">In House Production</option>{suppliers.map(s => <option key={s._id} value={s.supplierName}>{s.supplierName}</option>)}
              </select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">PO Reference</label><input type="text" value={formData.purchaseOrderRef} onChange={(e) => setFormData({...formData, purchaseOrderRef: e.target.value})} placeholder="PO-XXXX" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Item <span className="text-red-500">*</span></label>
              <select value={formData.itemName} onChange={(e) => setFormData({...formData, itemName: e.target.value})} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Select Item</option>{items.map(i => <option key={i._id} value={i._id}>{i.itemName}</option>)}
              </select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Qty Received <span className="text-red-500">*</span></label><input type="number" min="1" value={formData.qtyReceived} onChange={(e) => setFormData({...formData, qtyReceived: e.target.value})} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Location <span className="text-red-500">*</span></label>
              <select value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Select Location</option>{locations.map(l => <option key={l._id} value={l._id}>{l.locationName}</option>)}
              </select></div>
          </div>
          <div className="mb-6"><label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label><input type="text" value={formData.remarks} onChange={(e) => setFormData({...formData, remarks: e.target.value})} placeholder="Optional" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
          <div className="flex justify-end"><button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg flex items-center gap-2 min-w-[120px] justify-center disabled:opacity-70">{saving ? <Loader2 size={18} className="animate-spin" /> : null}{saving ? 'Saving...' : 'Save GRN'}</button></div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="text-lg font-bold text-gray-800">GRN Records</h3>
          <div className="relative"><input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full sm:w-64" /><Search className="absolute left-3 top-2.5 text-gray-400" size={18} /></div>
        </div>
        <div className="overflow-x-auto">
          {loading ? <div className="flex justify-center p-12 text-blue-600"><Loader2 size={40} className="animate-spin" /></div> : filtered.length > 0 ? (
            <table className="w-full text-left"><thead><tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">GRN No</th><th className="px-6 py-4 font-semibold">Date</th><th className="px-6 py-4 font-semibold">Supplier</th><th className="px-6 py-4 font-semibold">Item</th><th className="px-6 py-4 font-semibold">Qty</th><th className="px-6 py-4 font-semibold">Location</th><th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr></thead>
              <tbody className="divide-y divide-gray-100">{filtered.map(item => (
                <tr key={item._id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 text-sm font-bold text-blue-600">{item.grnNo}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{new Date(item.grnDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{item.supplierName}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{item.itemName?.itemName || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm font-bold text-green-600">{item.qtyReceived}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.location?.locationName || 'N/A'}</td>
                  <td className="px-6 py-4 text-right"><button onClick={() => confirmDelete(item)} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100"><Trash2 size={16} /></button></td>
                </tr>))}</tbody></table>
          ) : <div className="p-12 text-center text-gray-500">{searchTerm ? 'No match.' : 'No GRN records found.'}</div>}
        </div>
      </div>

      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"><div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-4 mx-auto"><Trash2 size={24} /></div>
          <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Delete GRN</h3>
          <p className="text-center text-gray-500 mb-6">Delete <span className="font-bold text-gray-800">{itemToDelete?.grnNo}</span>?</p>
          <div className="flex gap-4"><button onClick={() => setDeleteModalOpen(false)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg">Cancel</button><button onClick={handleDelete} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg">Delete</button></div>
        </div></div>
      )}
    </div>
  );
};

export default StockIn;
