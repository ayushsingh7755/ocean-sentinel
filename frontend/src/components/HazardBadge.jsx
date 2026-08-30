import { HAZARD_COLORS, HAZARD_DOT } from '../utils/constants';

const HazardBadge = ({ level, score, size = 'sm', showScore = true }) => {
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5'
  };

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full border font-medium mono tracking-widest uppercase ${HAZARD_COLORS[level]} ${sizeClasses[size]}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${HAZARD_DOT[level]} animate-pulse`} />
      {level}
      {showScore && score && <span className="opacity-70">• {score}</span>}
    </div>
  );
};

export default HazardBadge;
