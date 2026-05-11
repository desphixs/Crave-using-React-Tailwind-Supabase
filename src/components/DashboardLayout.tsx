import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileDashboardNav from './MobileDashboardNav';

const DashboardLayout = () => {
  return (
    <div className="flex w-full max-w-7xl mx-auto min-h-screen overflow-x-hidden">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 pb-28 md:pb-8">
        <div className="bg-zinc-900/30 rounded-3xl border border-zinc-800/50 p-6 md:p-8 min-h-full backdrop-blur-sm">
          <Outlet />
        </div>
      </main>
      <MobileDashboardNav />
    </div>
  );
};

export default DashboardLayout;
