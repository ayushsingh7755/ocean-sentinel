import { motion } from 'framer-motion';
import { FaCheck, FaSpinner, FaClock } from 'react-icons/fa';

const LoadingPipeline = ({ stages = [], currentStage = 0 }) => {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="glass-strong rounded-[24px] p-8">
        <div className="text-center mb-8">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border border-cyan-400/20 animate-ping-slow" />
            <div className="absolute inset-2 rounded-full border border-cyan-400/30 animate-ping-slow animation-delay-500" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-bold">AI Analysis Pipeline</h3>
          <p className="text-sm text-white/50 mono mt-1">Processing Side-Scan Sonar Data</p>
        </div>

        <div className="space-y-3">
          {stages.map((stage, idx) => {
            const isCompleted = idx < currentStage;
            const isActive = idx === currentStage;
            const isPending = idx > currentStage;

            return (
              <motion.div
                key={stage.id || idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`flex items-center gap-4 p-3 rounded-xl border transition ${
                  isActive ? 'bg-cyan-500/10 border-cyan-500/30' : 
                  isCompleted ? 'bg-emerald-500/5 border-emerald-500/20' :
                  'bg-white/[0.02] border-white/5'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  isCompleted ? 'bg-emerald-500 text-white' :
                  isActive ? 'bg-cyan-500 text-black animate-pulse' :
                  'bg-white/5 text-white/30'
                }`}>
                  {isCompleted ? <FaCheck className="text-xs" /> : isActive ? <FaSpinner className="animate-spin text-xs" /> : <FaClock className="text-xs" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isActive ? 'text-cyan-400' : isCompleted ? 'text-white' : 'text-white/40'}`}>
                    {stage.name}
                  </p>
                  <p className="text-[11px] mono text-white/30">
                    Stage {idx + 1} • {stage.status}
                  </p>
                </div>
                {isCompleted && (
                  <span className="text-[10px] mono px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    DONE
                  </span>
                )}
                {isActive && (
                  <span className="text-[10px] mono px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 animate-pulse">
                    RUNNING
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 p-3 rounded-xl bg-[#020617] border border-white/5">
          <div className="flex justify-between text-[11px] mono text-white/40 mb-2">
            <span>Pipeline Progress</span>
            <span>{Math.round((currentStage / Math.max(stages.length,1)) * 100)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(currentStage / Math.max(stages.length,1)) * 100}%` }}
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingPipeline;
