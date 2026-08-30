import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { FaWater, FaSignOutAlt, FaUser } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-[64px] flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
            <FaWater className="text-white text-lg" />
          </div>
          <div>
            <h1 className="font-bold text-[16px] leading-none tracking-tight">OceanSentinel AI</h1>
            <p className="text-[10px] text-cyan-400/80 mono tracking-widest uppercase">Marine Intelligence</p>
          </div>
        </Link>

        <div className="flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'} className="text-sm text-white/70 hover:text-white transition">
                Dashboard
              </Link>
              <Link to="/missions" className="text-sm text-white/70 hover:text-white transition">
                Missions
              </Link>
              <Link to="/map" className="text-sm text-white/70 hover:text-white transition">
                Marine Map
              </Link>
              <div className="h-5 w-px bg-white/10" />
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-[11px] text-white/50">{user?.role} • {user?.organization}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
                  <FaUser className="text-cyan-400 text-xs" />
                </div>
                <button onClick={handleLogout} className="ml-2 p-2 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition">
                  <FaSignOutAlt />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-white/70 hover:text-white transition">Login</Link>
              <Link to="/register" className="px-4 py-2 rounded-xl bg-white text-black text-sm font-medium hover:bg-white/90 transition">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
