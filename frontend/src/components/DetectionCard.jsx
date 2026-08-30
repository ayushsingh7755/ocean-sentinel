import { Link } from 'react-router-dom';
import HazardBadge from './HazardBadge';
import { formatConfidence, formatCoordinate } from '../utils/formatters';
import { FaMapMarkerAlt, FaRulerCombined, FaEye } from 'react-icons/fa';

const DetectionCard = ({ detection }) => {
  return (
    <div className="glass rounded-2xl p-4 hover:border-white/15 transition group">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-[15px] flex items-center gap-2">
            {detection.objectType}
            <span className="text-[11px] mono text-white/40">• {detection.imageName?.slice(0, 18)}</span>
          </h4>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 mono text-white/60">
              {formatConfidence(detection.confidence)} • {detection.confidenceLabel}
            </span>
          </div>
        </div>
        <HazardBadge level={detection.hazardLevel} score={detection.hazardScore} />
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs mb-4">
        <div className="flex items-center gap-2 text-white/50">
          <FaRulerCombined className="text-cyan-400/60" />
          <span>{detection.estimatedWidthMeters}m × {detection.estimatedLengthMeters}m</span>
        </div>
        <div className="flex items-center gap-2 text-white/50">
          <FaMapMarkerAlt className="text-cyan-400/60" />
          <span className="mono">{formatCoordinate(detection.latitude)}, {formatCoordinate(detection.longitude)}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Link
          to={`/anomalies/${detection._id}`}
          className="flex-1 py-2 rounded-xl bg-white text-black text-xs font-medium text-center hover:bg-white/90 transition flex items-center justify-center gap-1.5"
        >
          <FaEye /> View Details
        </Link>
        <Link
          to={`/map?focus=${detection._id}`}
          className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs mono text-white/70 hover:bg-white/10 hover:text-white transition"
        >
          Map
        </Link>
      </div>
    </div>
  );
};

export default DetectionCard;
