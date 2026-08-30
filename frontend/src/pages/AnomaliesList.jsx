import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import DetectionCard from '../components/DetectionCard';
import { FaSearch } from 'react-icons/fa';

const AnomaliesList = () => {
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('HIGH');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = new URLSearchParams();
        if (filter) params.append('hazardLevel', filter);
        if (search) params.append('search', search);
        params.append('limit', '50');
        
        let url = '/detections';
        if (filter === 'HIGH_CRITICAL') {
          url = '/detections/high-risk';
        } else {
          url = `/detections?${params.toString()}`;
        }
        
        const res = await api.get(url);
        setDetections(res.data.data.detections || res.data.data.anomalies || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filter, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">High-Risk Anomalies</h1>
        <p className="text-sm text-white/50 mono mt-1">Prioritized hazards requiring investigation</p>
      </div>

      <div className="glass rounded-2xl p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search ghost nets, pipes..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#020617] border border-white/10 focus:border-cyan-400/50 focus:outline-none text-sm"
          />
        </div>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-[#020617] border border-white/10 text-sm focus:border-cyan-400/50 focus:outline-none"
        >
          <option value="">All Levels</option>
          <option value="CRITICAL">Critical Only</option>
          <option value="HIGH">High Only</option>
          <option value="HIGH_CRITICAL">High & Critical (API)</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {detections.map(d => (
            <DetectionCard key={d._id} detection={d} />
          ))}
          {detections.length === 0 && (
            <div className="col-span-full glass rounded-2xl p-12 text-center">
              <p className="text-white/40">No high-risk anomalies found matching filters</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnomaliesList;
