import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import MapComponent from '../components/MapComponent';
import HazardBadge from '../components/HazardBadge';

const MapView = () => {
  const [searchParams] = useSearchParams();
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterHazard, setFilterHazard] = useState('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    const fetchDetections = async () => {
      try {
        const params = new URLSearchParams();
        if (filterHazard) params.append('hazardLevel', filterHazard);
        if (filterType) params.append('objectType', filterType);
        const missionId = searchParams.get('mission');
        if (missionId) params.append('missionId', missionId);
        params.append('limit', '200');
        
        const res = await api.get(`/detections?${params.toString()}`);
        setDetections(res.data.data.detections);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDetections();
  }, [filterHazard, filterType, searchParams]);

  const stats = {
    total: detections.length,
    critical: detections.filter(d => d.hazardLevel === 'CRITICAL').length,
    high: detections.filter(d => d.hazardLevel === 'HIGH').length
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marine Anomaly Map</h1>
          <p className="text-sm text-white/50 mono mt-1">Geospatial visualization of detected debris • {stats.total} anomalies</p>
        </div>
        <div className="flex gap-2">
          <div className="px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs mono">
            {stats.critical} Critical
          </div>
          <div className="px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs mono">
            {stats.high} High Risk
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-4 flex flex-wrap gap-3">
        <select
          value={filterHazard}
          onChange={e => setFilterHazard(e.target.value)}
          className="px-4 py-2 rounded-xl bg-[#020617] border border-white/10 text-sm focus:border-cyan-400/50 focus:outline-none"
        >
          <option value="">All Hazard Levels</option>
          <option value="CRITICAL">Critical Only</option>
          <option value="HIGH">High & Critical</option>
          <option value="MEDIUM">Medium+</option>
          <option value="LOW">Low</option>
        </select>

        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="px-4 py-2 rounded-xl bg-[#020617] border border-white/10 text-sm focus:border-cyan-400/50 focus:outline-none"
        >
          <option value="">All Object Types</option>
          <option value="Ghost Net">Ghost Nets</option>
          <option value="Pipe">Pipes</option>
          <option value="Cylinder">Cylinders</option>
          <option value="Shipwreck">Shipwrecks</option>
          <option value="Unknown Debris">Unknown Debris</option>
        </select>

        <div className="ml-auto flex items-center gap-3 text-[11px] mono">
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> LOW</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-yellow-500" /> MEDIUM</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-orange-500" /> HIGH</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /> CRITICAL</div>
        </div>
      </div>

      {loading ? (
        <div className="h-[600px] glass rounded-2xl flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
        </div>
      ) : (
        <MapComponent detections={detections} height="680px" />
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <div className="glass rounded-xl p-4">
          <h4 className="text-sm font-semibold mb-2">Map Controls</h4>
          <ul className="text-xs text-white/50 space-y-1 mono">
            <li>• Click markers for anomaly details</li>
            <li>• Color indicates hazard level</li>
            <li>• Filter by type and risk</li>
          </ul>
        </div>
        <div className="glass rounded-xl p-4">
          <h4 className="text-sm font-semibold mb-2">Data Source</h4>
          <p className="text-xs text-white/50 mono">Side-Scan Sonar • 600kHz • AI detection v1.0<br />±2m GPS accuracy • Real-time processing</p>
        </div>
        <div className="glass rounded-xl p-4">
          <h4 className="text-sm font-semibold mb-2">Coverage</h4>
          <p className="text-xs text-white/50 mono">{detections.length} anomalies across {new Set(detections.map(d => d.mission?._id)).size || 1} missions<br />Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default MapView;
