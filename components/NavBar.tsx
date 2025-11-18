import React from 'react';
import { Home, User, Activity } from 'lucide-react';

interface NavBarProps {
  activeTab: 'dashboard' | 'profile';
  onTabChange: (tab: 'dashboard' | 'profile') => void;
}

const NavBar: React.FC<NavBarProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4 flex justify-center pointer-events-none">
      <nav className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-3 shadow-2xl shadow-black/50 pointer-events-auto flex items-center gap-8 max-w-sm w-full justify-between">
        
        <button 
          onClick={() => onTabChange('dashboard')}
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'dashboard' ? 'text-purple-400 scale-110' : 'text-white/40 hover:text-white/70'}`}
        >
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-medium">Home</span>
        </button>

        {/* Decorative middle button (could be quick start workout in future) */}
        <div className="w-12 h-12 -mt-8 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/40 border-4 border-black/20 relative">
            <Activity className="w-6 h-6 text-white" />
        </div>

        <button 
          onClick={() => onTabChange('profile')}
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'profile' ? 'text-purple-400 scale-110' : 'text-white/40 hover:text-white/70'}`}
        >
          <User className="w-6 h-6" />
          <span className="text-[10px] font-medium">Profile</span>
        </button>

      </nav>
    </div>
  );
};

export default NavBar;