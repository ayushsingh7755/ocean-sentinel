import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import HazardBadge from '../components/HazardBadge';
import MapComponent from '../components/MapComponent';
import { formatConfidence, formatCoordinate, formatDateTime } from '../utils/formatters';
import { FaMapMarkerAlt, FaRulerCombined, FaRobot, FaExclamationTriangle } from 'react-icons/fa';

const AnomalyDetails = () => {
  const { id } = useParams();
  const [detection, setDetection] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetection = async () => {
      try {
        const res = await api.get(`/detections/${id}`);
        setDetection(res.data.data.detection);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDetection();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!detection) {
    return <div className="text-center py-20 text-white/50">Anomaly not found</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm mono text-white/40">
        <Link to="/map" className="hover:text-white">Marine Map</Link>
        <span>•</span>
        <Link to={`/analysis/${detection.mission?._id}`} className="hover:text-white">Mission</Link>
        <span>•</span>
        <span className="text-white">{detection.objectType}</span>
      </div>

      <div className="flex flex-wrap justify-between gap-4 items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            {detection.objectType}
            <HazardBadge level={detection.hazardLevel} score={detection.hazardScore} size="md" />
          </h1>
          <p className="text-sm text-white/50 mono mt-2">
            ID: {detection._id} • {formatDateTime(detection.timestamp)} • {detection.imageName}
          </p>
        </div>
        <Link to={`/map?focus=${detection._id}`} className="px-4 py-2 rounded-xl bg-white text-black text-sm font-medium hover:bg-white/90">
          View on Map
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Detection Overview */}
          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <FaExclamationTriangle className="text-cyan-400" /> Detection Overview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 rounded-xl bg-[#020617] border border-white/5">
                <p className="text-[11px] mono uppercase text-white/40">Object Type</p>
                <p className="font-semibold mt-1">{detection.objectType}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#020617] border border-white/5">
                <p className="text-[11px] mono uppercase text-white/40">Confidence</p>
                <p className="font-semibold mt-1">{formatConfidence(detection.confidence)}</p>
                <p className="text-xs mono text-cyan-400">{detection.confidenceLabel}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#020617] border border-white/5">
                <p className="text-[11px] mono uppercase text-white/40">Hazard Score</p>
                <p className="font-semibold mt-1">{detection.hazardScore}/100</p>
                <p className="text-xs mono text-red-400">{detection.hazardLevel}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#020617] border border-white/5">
                <p className="text-[11px] mono uppercase text-white/40">Mission</p>
                <p className="font-semibold mt-1 truncate">{detection.mission?.name || 'N/A'}</p>
                <p className="text-xs mono text-white/40">{detection.mission?.locationName}</p>
              </div>
            </div>
          </div>

          {/* Location & Dimensions */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FaMapMarkerAlt className="text-cyan-400" /> Location
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-white/40 mono text-xs">Latitude</span>
                  <span className="mono">{formatCoordinate(detection.latitude)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-white/40 mono text-xs">Longitude</span>
                  <span className="mono">{formatCoordinate(detection.longitude)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-white/40 mono text-xs">Depth</span>
                  <span className="mono">{detection.depth}m</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-white/40 mono text-xs">Timestamp</span>
                  <span className="mono text-xs">{formatDateTime(detection.timestamp)}</span>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FaRulerCombined className="text-cyan-400" /> Dimensions
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-white/40 mono text-xs">Width</span>
                  <span className="mono">{detection.estimatedWidthMeters}m</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-white/40 mono text-xs">Length</span>
                  <span className="mono">{detection.estimatedLengthMeters}m</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-white/40 mono text-xs">Area</span>
                  <span className="mono">{detection.estimatedArea}m²</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-white/40 mono text-xs">Bounding Box</span>
                  <span className="mono text-xs">{detection.boundingBox?.width}×{detection.boundingBox?.height}px</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Analysis */}
          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <FaRobot className="text-cyan-400" /> AI Analysis
              <span className="ml-2 text-[10px] mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 uppercase">AI-generated interpretation</span>
            </h3>
            <p className="text-sm leading-relaxed text-white/70 bg-[#020617] p-4 rounded-xl border border-white/5">
              {detection.aiInterpretation}
            </p>
          </div>

          <div className="glass rounded-2xl p-6 border-orange-500/20">
            <h3 className="font-semibold mb-3 text-orange-400">Action Recommendation</h3>
            <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/20">
              <p className="text-sm mono uppercase tracking-widest text-orange-400/80 mb-2">Recommended Priority: {detection.hazardLevel === 'CRITICAL' ? 'Immediate Investigation' : detection.hazardLevel === 'HIGH' ? 'Priority Investigation' : 'Routine Monitoring'}</p>
              <p className="text-sm text-white/80 leading-relaxed">{detection.recommendation}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass rounded-2xl p-4">
            <h3 className="font-semibold mb-3">Location Map</h3>
            <MapComponent detections={[detection]} center={[detection.latitude, detection.longitude]} zoom={12} height="300px" />
            <div className="mt-3 p-3 rounded-xl bg-[#020617] border border-white/5">
              <p className="text-[11px] mono text-white/40 uppercase">Coordinates</p>
              <p className="mono text-sm mt-1">{detection.latitude.toFixed(5)}, {detection.longitude.toFixed(5)}</p>
            </div>
          </div>

          <div className="glass rounded-2xl p-5">
            <h4 className="font-semibold mb-3">Detection Metadata</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-white/40">Image</span><span className="mono truncate max-w-[140px]">{detection.imageName}</span></div>
              <div className="flex justify-between"><span className="text-white/40">Model</span><span className="mono">YOLOv8-SSS v1.0</span></div>
              <div className="flex justify-between"><span className="text-white/40">Processed</span><span className="mono">{formatDateTime(detection.createdAt)}</span></div>
              <div className="flex justify-between"><span className="text-white/40">Anomaly</span><span className="mono">{detection.isAnomaly ? 'Yes' : 'No'}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnomalyDetails;
