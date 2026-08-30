import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaWater, FaExclamationTriangle, FaImages, FaChartLine } from 'react-icons/fa';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../services/api';
import StatCard from '../components/StatCard';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [system, setSystem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [dashRes, sysRes] = await Promise.all([
          api.get('/analytics/dashboard'),
          api.get('/analytics/system').catch(() => ({ data: { data: null } }))
        ]);
        setData(dashRes.data.data);
        setSystem(sysRes.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  const COLORS = ['#22d3ee', '#0ea5e9', '#f97316', '#ef4444', '#8b5cf6', '#10b981'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-white/50 mono mt-1">Global platform analytics • All missions and users</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Users" value={data?.stats.totalUsers || 0} icon={FaUsers} color="violet" subtitle="Researchers + Admins" />
        <StatCard title="Total Missions" value={data?.stats.totalMissions || 0} icon={FaChartLine} color="cyan" subtitle="All surveys" />
        <StatCard title="Total Images" value={(data?.stats.totalImages || 0).toLocaleString()} icon={FaImages} color="emerald" subtitle="Sonar frames" />
        <StatCard title="Detections" value={data?.stats.totalDetections || 0} icon={FaWater} color="orange" subtitle="Artificial anomalies" />
        <StatCard title="Critical" value={data?.stats.criticalCount || 0} icon={FaExclamationTriangle} color="red" subtitle="Immediate action" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <h3 className="font-semibold mb-6">Monthly Analysis Activity</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.charts.trend || []}>
                <XAxis dataKey="month" stroke="#475569" fontSize={12} />
                <YAxis stroke="#475569" fontSize={12} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                <Line type="monotone" dataKey="hazards" stroke="#22d3ee" strokeWidth={2.5} dot={{ fill: '#22d3ee', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold mb-6">Detection Types</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data?.charts.objectDistribution || []} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                  {data?.charts.objectDistribution?.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold mb-6">Hazard Distribution</h3>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.charts.riskDistribution || []}>
                <XAxis dataKey="level" stroke="#475569" fontSize={11} />
                <YAxis stroke="#475569" fontSize={11} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                <Bar dataKey="count" radius={[8,8,0,0]}>
                  {(data?.charts.riskDistribution || []).map((entry, idx) => (
                    <Cell key={idx} fill={
                      entry.level === 'CRITICAL' ? '#ef4444' :
                      entry.level === 'HIGH' ? '#f97316' :
                      entry.level === 'MEDIUM' ? '#eab308' : '#10b981'
                    } />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold">Top Critical Anomalies</h3>
            <Link to="/map" className="text-xs mono text-cyan-400">View Map →</Link>
          </div>
          <div className="space-y-3">
            {data?.topCritical?.length > 0 ? data.topCritical.map((a) => (
              <div key={a._id} className="flex items-center justify-between p-3 rounded-xl bg-[#020617] border border-white/5">
                <div>
                  <p className="text-sm font-medium">{a.objectType} • {a.hazardScore}/100</p>
                  <p className="text-xs mono text-white/40">{a.mission?.name} • {a.latitude.toFixed(3)}, {a.longitude.toFixed(3)}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[11px] mono border border-red-500/20">CRITICAL</span>
              </div>
            )) : (
              <div className="text-center py-10 text-white/30 text-sm">No critical anomalies yet. Data will appear after analysis.</div>
            )}
          </div>
        </div>
      </div>

      {system && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="glass rounded-2xl p-6">
            <h4 className="font-semibold mb-4">Users by Role</h4>
            <div className="space-y-2">
              {system.usersByRole?.map(u => (
                <div key={u._id} className="flex justify-between text-sm">
                  <span className="capitalize text-white/60">{u._id}</span>
                  <span className="mono font-bold">{u.count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="glass rounded-2xl p-6">
            <h4 className="font-semibold mb-4">Missions by Status</h4>
            <div className="space-y-2">
              {system.missionsByStatus?.map(m => (
                <div key={m._id} className="flex justify-between text-sm">
                  <span className="capitalize text-white/60">{m._id}</span>
                  <span className="mono font-bold">{m.count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="glass rounded-2xl p-6">
            <h4 className="font-semibold mb-4">Vehicle Types</h4>
            <div className="space-y-2">
              {system.missionsByVehicle?.map(v => (
                <div key={v._id} className="flex justify-between text-sm">
                  <span className="text-white/60">{v._id}</span>
                  <span className="mono font-bold">{v.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
