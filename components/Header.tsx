import React, { useState, useRef, useEffect } from 'react';
import { User, Plus, ChevronDown, Sun, Moon } from 'lucide-react';
import { UserProfile } from '../types';
import { GlassCard } from './ui/GlassCard';

interface HeaderProps {
  currentProfile?: UserProfile | null;
  allProfiles?: UserProfile[];
  onSwitchProfile?: (id: string) => void;
  onAddProfile?: () => void;
  onNavigate?: (view: 'dashboard' | 'profile') => void;
  currentView?: 'dashboard' | 'profile';
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  currentProfile, 
  allProfiles = [], 
  onSwitchProfile, 
  onAddProfile, 
  onNavigate, 
  currentView,
  theme,
  onToggleTheme
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
    <header className="fixed top-0 left-0 right-0 h-16 z-[60] bg-white/70 dark:bg-black/20 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 flex items-center justify-between px-4 md:px-6 transition-all duration-300">
      <div 
        onClick={() => currentProfile && onNavigate?.('dashboard')}
        className={`flex items-center gap-2 transition-opacity ${currentProfile ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
      >
        <img src="https://cdn-icons-png.flaticon.com/512/2964/2964514.png" alt="Gym Buddy Logo" className="w-8 h-8 object-contain" />
        <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Gym Buddy</span>
      </div>

      <div className="flex items-center gap-3">
         {/* Theme Toggle */}
         <button 
            onClick={onToggleTheme}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 flex items-center justify-center transition-colors border border-gray-200 dark:border-white/5 text-gray-600 dark:text-white/70"
            aria-label="Toggle Theme"
         >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
         </button>
         
         <div className="relative" ref={menuRef}>
            {currentProfile ? (
              <>
                <button 
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className={`
                      flex items-center gap-2 pl-1 pr-3 py-1 rounded-full transition-all border-2 cursor-pointer
                      ${isProfileMenuOpen ? 'bg-gray-100 dark:bg-white/10 border-purple-500/50' : 'border-transparent hover:bg-gray-100 dark:hover:bg-white/5'}
                    `}
                >
                   <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center shadow-inner
                      bg-gradient-to-r from-blue-400 to-cyan-400
                    `}>
                     <span className="text-xs font-bold text-white drop-shadow-md">
                       {currentProfile.name.charAt(0).toUpperCase()}
                     </span>
                   </div>
                   <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-white/50 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 top-12 w-64 animate-fade-in-up origin-top-right z-[60]">
                    <div className="overflow-hidden flex flex-col shadow-2xl rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                      <div className="p-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-2">Current Profile</p>
                        <div className="flex items-center justify-between group cursor-pointer" onClick={() => {
                            onNavigate?.('profile');
                            setIsProfileMenuOpen(false);
                        }}>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center text-white text-xs font-bold">
                                    {currentProfile.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-gray-900 dark:text-white text-sm font-medium">{currentProfile.name}</span>
                                    <span className="text-xs text-purple-500 dark:text-purple-400">View Settings</span>
                                </div>
                            </div>
                        </div>
                      </div>

                      {allProfiles.length > 1 && (
                         <div className="p-2 border-b border-gray-200 dark:border-gray-800 max-h-48 overflow-y-auto">
                            <p className="px-2 py-1 text-[10px] text-gray-500 dark:text-gray-400 uppercase">Switch Account</p>
                            {allProfiles.filter(p => p.id !== currentProfile.id).map(profile => (
                                <button 
                                    key={profile.id}
                                    onClick={() => {
                                        onSwitchProfile?.(profile.id);
                                        setIsProfileMenuOpen(false);
                                    }}
                                    className="w-full text-left px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg flex items-center gap-3 group transition-colors"
                                >
                                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-300 text-[10px] font-bold group-hover:bg-gray-300 dark:group-hover:bg-gray-600 group-hover:text-gray-900 dark:group-hover:text-white">
                                        {profile.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-gray-600 dark:text-gray-300 text-sm group-hover:text-gray-900 dark:group-hover:text-white">{profile.name}</span>
                                </button>
                            ))}
                         </div>
                      )}

                      <div className="p-2 bg-gray-50 dark:bg-gray-800/50">
                          <button 
                            onClick={() => {
                                onAddProfile?.();
                                setIsProfileMenuOpen(false);
                            }}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-semibold text-gray-700 dark:text-white bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all shadow-sm hover:shadow-md"
                          >
                              <Plus className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Add New Profile
                          </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
               <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-500 dark:text-white/50" />
               </div>
            )}
         </div>
      </div>
    </header>
  );
};

export default Header;