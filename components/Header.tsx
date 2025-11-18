import React, { useState, useRef, useEffect } from 'react';
import { Dumbbell, Bell, User, Plus, Check, ChevronDown, LogOut } from 'lucide-react';
import { UserProfile } from '../types';
import { GlassCard } from './ui/GlassCard';

interface HeaderProps {
  currentProfile?: UserProfile;
  allProfiles?: UserProfile[];
  onSwitchProfile?: (id: string) => void;
  onAddProfile?: () => void;
  onNavigate?: (view: 'dashboard' | 'profile') => void;
  currentView?: 'dashboard' | 'profile';
}

const Header: React.FC<HeaderProps> = ({ 
  currentProfile, 
  allProfiles = [], 
  onSwitchProfile, 
  onAddProfile, 
  onNavigate, 
  currentView 
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-40 bg-black/20 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-4 md:px-6 transition-all">
      <div 
        onClick={() => onNavigate?.('dashboard')}
        className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
          <Dumbbell className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold text-white tracking-tight">GymBuddy</span>
      </div>

      <div className="flex items-center gap-3">
         <button className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors border border-white/5 relative">
            <Bell className="w-5 h-5 text-white/70" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-black"></span>
         </button>
         
         <div className="relative" ref={menuRef}>
            <button 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className={`
                  flex items-center gap-2 pl-1 pr-3 py-1 rounded-full transition-all border-2 cursor-pointer
                  ${isProfileMenuOpen ? 'bg-white/10 border-purple-500/50' : 'border-transparent hover:bg-white/5'}
                `}
            >
               <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center shadow-inner
                  bg-gradient-to-r from-blue-400 to-cyan-400
                `}>
                 <span className="text-xs font-bold text-white drop-shadow-md">
                   {currentProfile?.name.charAt(0).toUpperCase()}
                 </span>
               </div>
               <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Profile Dropdown */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 top-12 w-64 animate-fade-in-up origin-top-right">
                <GlassCard className="overflow-hidden flex flex-col shadow-2xl border-white/20">
                  <div className="p-3 border-b border-white/10 bg-white/5">
                    <p className="text-xs text-white/50 uppercase font-bold tracking-wider mb-2">Current Profile</p>
                    <div className="flex items-center justify-between group cursor-pointer" onClick={() => {
                        onNavigate?.('profile');
                        setIsProfileMenuOpen(false);
                    }}>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center text-white text-xs font-bold">
                                {currentProfile?.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-white text-sm font-medium">{currentProfile?.name}</span>
                                <span className="text-xs text-purple-300">View Settings</span>
                            </div>
                        </div>
                    </div>
                  </div>

                  {allProfiles.length > 1 && (
                     <div className="p-2 border-b border-white/10 max-h-48 overflow-y-auto">
                        <p className="px-2 py-1 text-[10px] text-white/40 uppercase">Switch Account</p>
                        {allProfiles.filter(p => p.id !== currentProfile?.id).map(profile => (
                            <button 
                                key={profile.id}
                                onClick={() => {
                                    onSwitchProfile?.(profile.id);
                                    setIsProfileMenuOpen(false);
                                }}
                                className="w-full text-left px-2 py-2 hover:bg-white/10 rounded-lg flex items-center gap-3 group transition-colors"
                            >
                                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/60 text-[10px] font-bold group-hover:bg-white/20 group-hover:text-white">
                                    {profile.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-white/70 text-sm group-hover:text-white">{profile.name}</span>
                            </button>
                        ))}
                     </div>
                  )}

                  <div className="p-2 bg-black/20">
                      <button 
                        onClick={() => {
                            onAddProfile?.();
                            setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                          <Plus className="w-4 h-4" /> Add New Profile
                      </button>
                  </div>
                </GlassCard>
              </div>
            )}
         </div>
      </div>
    </header>
  );
};

export default Header;