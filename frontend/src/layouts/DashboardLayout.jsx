import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-[#020617]">
      <Navbar />
      <div className="flex pt-[64px]">
        <Sidebar />
        <main className="flex-1 min-w-0 bg-[#020617]">
          <div className="p-6 max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
