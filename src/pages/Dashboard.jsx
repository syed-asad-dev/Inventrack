import { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, AlertTriangle, ArrowDownCircle, ArrowUpCircle, Warehouse, Loader2 } from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_URL || '';

const Dashboard = () => {
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/dashboard`);
      setDashData(res.data);
    } catch { /* silent */ } finally { setLoading(false); }
  };

  if (loading) return <div className="flex justify-center items-center h-[60vh]"><Loader2 size={48} className="animate-spin text-blue-600" /></div>;

  const stats = [
    { title: "Total Stock", value: dashData?.totalStock?.toLocaleString() || '0', icon: Package, color: "blue" },
    { title: "Low Stock Items", value: dashData?.lowStockCount || '0', icon: AlertTriangle, color: dashData?.lowStockCount > 0 ? "red" : "green" },
    { title: "Daily Stock", inOut: { in: dashData?.dailyIn || 0, out: dashData?.dailyOut || 0 }, icon: ArrowDownCircle, color: "purple" },
    { title: "Warehouses", value: dashData?.locationCount || '0', icon: Warehouse, color: "blue" },
  ];

  const recentActivity = dashData?.recentActivity || [];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="glass-card p-6 flex flex-col justify-between h-36 border border-white/50 shadow-sm relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 text-blue-50 opacity-50 group-hover:scale-110 transition-transform duration-500"><Icon size={120} /></div>
              <div className="flex justify-between items-start relative z-10">
                <h3 className="text-gray-600 font-medium">{stat.title}</h3>
                <div className={`p-2 rounded-lg ${stat.color === 'red' ? 'bg-red-50 text-red-600' : stat.color === 'green' ? 'bg-green-50 text-green-600' : stat.color === 'purple' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}><Icon size={20} /></div>
              </div>
              <div className="relative z-10">
                {stat.inOut ? (
                  <div className="flex gap-4"><span className="text-green-600 font-bold text-2xl">In: {stat.inOut.in}</span><span className="text-red-500 font-bold text-2xl">Out: {stat.inOut.out}</span></div>
                ) : (
                  <h2 className="text-3xl font-bold text-gray-800">{stat.value}</h2>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">Recent Stock Activity</h3>
        </div>
        <div className="overflow-x-auto">
          {recentActivity.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead><tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Date</th><th className="px-6 py-4 font-semibold">Type</th><th className="px-6 py-4 font-semibold">Item</th><th className="px-6 py-4 font-semibold">Qty</th><th className="px-6 py-4 font-semibold">Location</th><th className="px-6 py-4 font-semibold">Reference</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {recentActivity.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(row.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${row.type === 'IN' ? 'bg-green-100 text-green-700' : row.type === 'OUT' ? 'bg-red-100 text-red-700' : 'bg-purple-100 text-purple-700'}`}>
                        {row.type === 'IN' ? <ArrowDownCircle size={12}/> : <ArrowUpCircle size={12}/>}{row.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{row.item}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-700">{row.qty}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{row.location}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{row.ref}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <div className="p-8 text-center text-gray-500">No recent activity found</div>}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
