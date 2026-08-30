import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-6xl font-bold">404</h1>
        <p className="text-white/50 mt-2">Sonar target not found</p>
        <Link to="/" className="mt-6 inline-block px-6 py-2.5 rounded-xl bg-white text-black text-sm font-medium">
          Return to Surface
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
