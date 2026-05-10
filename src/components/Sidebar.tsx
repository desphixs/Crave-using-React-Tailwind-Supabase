import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Bookmark, Settings } from 'lucide-react';

const Sidebar = () => {
  const links = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/dashboard/add', label: 'Add Recipe', icon: PlusCircle },
    { to: '/recipe-box', label: 'Recipe Box', icon: Bookmark },
  ];

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-800 h-[calc(100vh-80px)] sticky top-20 hidden lg:block">
      <div className="p-6 space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-pink-600/10 text-pink-500 border border-pink-500/20' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`
            }
          >
            <link.icon className="w-5 h-5" />
            <span className="font-medium">{link.label}</span>
          </NavLink>
        ))}
      </div>
      
      <div className="absolute bottom-8 left-0 right-0 px-6">
        <div className="p-4 bg-gradient-to-br from-zinc-900 to-black rounded-2xl border border-zinc-800">
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2">Pro Plan</p>
          <p className="text-sm text-zinc-300 mb-3">Unlock unlimited recipe storage.</p>
          <button className="w-full py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-pink-500 hover:text-white transition-colors">
            Upgrade
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
