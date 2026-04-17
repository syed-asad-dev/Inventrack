import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_URL || '';

const Reports = () => {
  const [reportType, setReportType] = useState('stock');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ itemId: '', categoryId: '', startDate: '', endDate: '' });

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try { const res = await axios.get(`${BASE_URL}/api/items`); setItems(Array.isArray(res.data) ? res.data : []); } catch { /* silent */ }
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ type: reportType });
      if (filters.itemId) params.append('itemId', filters.itemId);
      if (filters.categoryId) params.append('categoryId', filters.categoryId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      const res = await axios.get(`${BASE_URL}/api/reports?${params.toString()}`);
      setReportData(Array.isArray(res.data) ? res.data : []);
    } catch (error) { toast.error(error.response?.data?.error || 'Failed to generate report'); setReportData([]); }
    finally { setLoading(false); }
  };

  const exportCSV = () => {
    if (!reportData.length) { toast.error('No data to export'); return; }
    const headers = Object.keys(reportData[0]).join(',');
    const rows = reportData.map(r => Object.values(r).join(',')).join('\n');
    const blob = new Blob([headers + '\n' + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${reportType}_report.csv`; a.click();
    toast.success('CSV exported');
  };

  const renderTable = () => {
    if (!reportData.length) return <div className="p-12 text-center text-gray-500">No data found. Adjust filters and generate again.</div>;
    const cols = Object.keys(reportData[0]);
    return (
      <table className="w-full text-left">
        <thead><tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
          {cols.map(c => <th key={c} className="px-6 py-4 font-semibold">{c.replace(/([A-Z])/g, ' $1').trim()}</th>)}
        </tr></thead>
        <tbody className="divide-y divide-gray-100">
          {reportData.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50/50">
              {cols.map(c => <td key={c} className={`px-6 py-4 text-sm ${c === 'status' ? (row[c] === 'Low' ? 'text-red-600 font-bold' : 'text-green-600 font-bold') : 'text-gray-700'}`}>{c === 'date' ? new Date(row[c]).toLocaleDateString() : row[c]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100"><h2 className="text-lg font-bold text-gray-800 uppercase tracking-wide">REPORTS</h2></div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <select value={reportType} onChange={(e) => { setReportType(e.target.value); setReportData([]); }} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="stock">Stock Report</option>
                <option value="ledger">Stock Ledger</option>
                <option value="stockin">Stock In Report</option>
                <option value="stockout">Stock Out Report</option>
              </select>
            </div>
            {(reportType === 'ledger') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Item <span className="text-red-500">*</span></label>
                <select value={filters.itemId} onChange={(e) => setFilters({...filters, itemId: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">Select Item</option>{items.map(i => <option key={i._id} value={i._id}>{i.itemName}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input type="date" value={filters.startDate} onChange={(e) => setFilters({...filters, startDate: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input type="date" value={filters.endDate} onChange={(e) => setFilters({...filters, endDate: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={generateReport} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg flex items-center gap-2 disabled:opacity-70">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />} Generate Report
            </button>
            <button onClick={exportCSV} className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2">
              <FileSpreadsheet size={18} /> Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">{reportType === 'stock' ? 'Stock Report' : reportType === 'ledger' ? 'Stock Ledger' : reportType === 'stockin' ? 'Stock In Report' : 'Stock Out Report'}</h3>
        </div>
        <div className="overflow-x-auto">
          {loading ? <div className="flex justify-center p-12 text-blue-600"><Loader2 size={40} className="animate-spin" /></div> : renderTable()}
        </div>
      </div>
    </div>
  );
};

export default Reports;
