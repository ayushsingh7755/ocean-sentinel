import { motion } from 'framer-motion';

const StatCard = ({ title, value, subtitle, icon: Icon, trend, color = 'cyan' }) => {
  const colorMap = {
    cyan: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/20 text-cyan-400',
    emerald: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/20 text-emerald-400',
    orange: 'from-orange-500/20 to-amber-500/20 border-orange-500/20 text-orange-400',
    red: 'from-red-500/20 to-rose-500/20 border-red-500/20 text-red-400',
    violet: 'from-violet-500/20 to-purple-500/20 border-violet-500/20 text-violet-400'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5 relative overflow-hidden group hover:border-white/15 transition"
    >
      <div className="absolute top-0 right-0 w-32 h-32 opacity-20 group-hover:opacity-30 transition">
        <div className={`w-full h-full rounded-full bg-gradient-to-br ${colorMap[color]} blur-2xl`} />
      </div>
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[color]} border flex items-center justify-center`}>
            <Icon className="text-lg" />
          </div>
          {trend && (
            <span className="text-[11px] mono px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/60">
              {trend}
            </span>
          )}
        </div>
        
        <p className="text-[11px] mono tracking-widest uppercase text-white/40 mb-1">{title}</p>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
        {subtitle && <p className="text-xs text-white/50 mt-1">{subtitle}</p>}
      </div>
    </motion.div>
  );
};

export default StatCard;
