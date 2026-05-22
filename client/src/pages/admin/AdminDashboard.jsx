import { useEffect, useState } from 'react';
import { Package, ShoppingBag, Users, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, RefreshCw, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, PieChart, Pie 
} from 'recharts';
import api from '../../services/api.js';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdminDashboard() {
  const cachedStats = (() => {
    try {
      const data = localStorage.getItem('mrmobi_cached_admin_stats');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  })();

  const [stats, setStats] = useState(cachedStats);
  const [loading, setLoading] = useState(cachedStats === null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats(false);
  }, []);

  const fetchStats = async (isManual = false) => {
    if (isManual || !stats) {
      setLoading(true);
    }
    setError(null);
    try {
      const { data } = await api.get('/admin/dashboard');
      if (data.error) {
        setError(data.error);
      } else {
        setStats(data);
        try {
          localStorage.setItem('mrmobi_cached_admin_stats', JSON.stringify(data));
        } catch {}
      }
    } catch (error) {
      console.error('Failed to fetch stats', error);
      setError('Connection to server failed. Please check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      <p className="text-gray-500 font-bold animate-pulse">Syncing real-time data...</p>
    </div>
  );

  const statCards = [
    { title: 'Total Revenue', value: `₹${stats?.revenue?.toLocaleString() || 0}`, icon: DollarSign, color: 'bg-green-500', trend: '+12.5%', isUp: true },
    { title: 'Total Orders', value: stats?.totalOrders || 0, icon: ShoppingBag, color: 'bg-blue-500', trend: '+8.2%', isUp: true },
    { title: 'Total Products', value: stats?.totalProducts || 0, icon: Package, color: 'bg-amber-500', trend: '+2.4%', isUp: true },
    { title: 'Delivered Orders', value: stats?.deliveredOrders || 0, icon: CheckCircle, color: 'bg-indigo-500', trend: '+14.2%', isUp: true },
    { title: 'Active Users', value: stats?.totalUsers || 0, icon: Users, color: 'bg-sky-500', trend: '+6.8%', isUp: true },
    { title: 'Canceled Orders', value: stats?.canceledOrders || 0, icon: XCircle, color: 'bg-rose-500', trend: '-4.1%', isUp: false },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-3xl font-black text-gray-950 tracking-tight">Dashboard Overview</h1>
          <p className="text-[9px] sm:text-sm text-gray-500 font-bold uppercase tracking-widest mt-0.5">Real-time analytics and performance metrics.</p>
        </div>
        <button 
          onClick={() => fetchStats(true)}
          className="p-2 sm:p-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all text-gray-600 hover:text-green-600"
          title="Refresh Data"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600">
          <AlertCircle size={18} />
          <p className="text-xs sm:text-sm font-bold">{error}</p>
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-6">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white p-3.5 sm:p-6 rounded-[1.5rem] sm:rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl ${card.color} text-white shadow-lg shadow-${card.color.split('-')[1]}-500/20 group-hover:scale-110 transition-transform`}>
                <card.icon size={16} className="sm:w-5 sm:h-5" />
              </div>
              <div className={`flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-xs font-black px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md sm:rounded-lg ${card.isUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {card.isUp ? <ArrowUpRight size={10} className="sm:w-3 sm:h-3" /> : <ArrowDownRight size={10} className="sm:w-3 sm:h-3" />}
                {card.trend}
              </div>
            </div>
            <h3 className="text-gray-400 text-[8px] sm:text-xs font-black uppercase tracking-widest mb-0.5 sm:mb-1">{card.title}</h3>
            <p className="text-lg sm:text-2xl font-black text-gray-950">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Revenue Area Chart */}
        <div className="lg:col-span-2 bg-white p-4 sm:p-8 rounded-[1.5rem] sm:rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <h3 className="text-base sm:text-lg font-black text-gray-950 tracking-tight">Revenue Analytics</h3>
              <p className="text-[9px] sm:text-sm text-gray-400 font-bold uppercase tracking-widest mt-0.5">Daily sales performance over time</p>
            </div>
            <div className="bg-gray-50 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl border border-gray-100 flex items-center gap-1.5">
               <TrendingUp size={12} className="text-green-500 sm:w-4 sm:h-4" />
               <span className="text-[9px] sm:text-xs font-bold text-gray-600">Sync Active</span>
            </div>
          </div>
          
          <div className="h-[200px] sm:h-[300px] w-full">
            {(!stats?.revenueData || stats.revenueData.length === 0) ? (
              <div className="h-full flex flex-col items-center justify-center bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100">
                 <p className="text-gray-400 font-bold text-xs">No revenue data available for this period</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.revenueData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                    itemStyle={{ fontWeight: 900, fontSize: '14px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#22c55e" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRev)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Category Pie Chart */}
        <div className="bg-white p-4 sm:p-8 rounded-[1.5rem] sm:rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-base sm:text-lg font-black text-gray-950 tracking-tight mb-0.5">Category Sales</h3>
          <p className="text-[9px] sm:text-sm text-gray-400 font-bold uppercase tracking-widest mb-6 sm:mb-8">Distribution of orders</p>
          
          <div className="h-[200px] sm:h-[240px] w-full relative">
            {(!stats?.categoryData || stats.categoryData.length === 0) ? (
              <div className="h-full flex items-center justify-center bg-gray-50/50 rounded-full border-2 border-dashed border-gray-100">
                <p className="text-gray-400 font-bold text-[9px] text-center px-4 uppercase tracking-widest">No Sales Yet</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.categoryData}
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={6}
                      dataKey="value"
                    >
                      {stats.categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xl sm:text-2xl font-black text-gray-950">{stats?.totalOrders}</span>
                    <span className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">Orders</span>
                </div>
              </>
            )}
          </div>

          <div className="mt-5 space-y-2.5">
            {(stats?.categoryData || []).map((cat, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                  <span className="text-[11px] sm:text-xs font-bold text-gray-600">{cat.name}</span>
                </div>
                <span className="text-[11px] sm:text-xs font-black text-gray-950">{cat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders List */}
      <div className="bg-white rounded-[1.5rem] sm:rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-8 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-black text-gray-950 tracking-tight">Recent Activity</h3>
            <p className="text-[9px] sm:text-sm text-gray-400 font-bold uppercase tracking-widest mt-0.5">Latest customer orders</p>
          </div>
          <button className="text-[9px] sm:text-xs font-black text-green-600 uppercase tracking-widest hover:underline underline-offset-4">
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-4 py-3 sm:px-8 sm:py-4 text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                <th className="px-4 py-3 sm:px-8 sm:py-4 text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">Product</th>
                <th className="px-4 py-3 sm:px-8 sm:py-4 text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                <th className="px-4 py-3 sm:px-8 sm:py-4 text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(!stats?.recentOrders || stats.recentOrders.length === 0) ? (
                <tr>
                  <td colSpan="4" className="px-4 py-8 sm:px-8 sm:py-12 text-center text-xs text-gray-400 font-bold italic">No recent activity to show</td>
                </tr>
              ) : (
                stats.recentOrders.map((order, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 sm:px-8 sm:py-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] sm:text-xs font-bold text-gray-600">
                          {order.customerName?.charAt(0)}
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-gray-950">{order.customerName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 sm:px-8 sm:py-4 text-xs sm:text-sm font-medium text-gray-600">{order.productName}</td>
                    <td className="px-4 py-3 sm:px-8 sm:py-4 text-xs sm:text-sm font-black text-gray-950">₹{order.totalPrice?.toLocaleString()}</td>
                    <td className="px-4 py-3 sm:px-8 sm:py-4">
                      <span className={`px-2 py-0.5 rounded text-[8px] sm:text-[10px] font-black uppercase tracking-wider ${
                        order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
