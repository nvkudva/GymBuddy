import React, { useState } from 'react';
import { UserProfile, FitnessGoal } from '../types';
import { GlassCard, GlassButton, GlassInput, GlassSelect } from './ui/GlassCard';
import { Save, RotateCcw, Trash2, User, Ruler, Scale, Target, Sparkles, Sun, Moon, Monitor } from 'lucide-react';

interface ProfileSettingsProps {
  profile: UserProfile;
  onUpdateProfile: (newProfile: UserProfile, shouldRegenerate: boolean) => void;
  onResetApp: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ profile, onUpdateProfile, onResetApp, theme, onToggleTheme }) => {
  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);
  const [isDirty, setIsDirty] = useState(false);

  const handleChange = (field: keyof UserProfile, value: string | number) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // If the goal changed, we should prompt or auto-regenerate. For now, we'll pass true to regenerate if goal matches.
    // To make it simpler, let's just ask if they want to regenerate plan if critical stats changed.
    // For this demo, we'll always ask the AI to regenerate if goal changes.
    
    const shouldRegenerate = editedProfile.goal !== profile.goal;
    onUpdateProfile(editedProfile, shouldRegenerate);
    setIsDirty(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto animate-fade-in pb-32">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Profile & Settings</h1>
      
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* App Settings Card */}
        <GlassCard className="p-6 md:p-8">
           <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-blue-500 dark:text-blue-400" /> App Settings
          </h2>
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="p-2 rounded-lg bg-gray-100 dark:bg-white/10">
                   {theme === 'dark' ? <Moon className="w-5 h-5 text-purple-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
                 </div>
                 <div>
                    <div className="font-medium text-gray-900 dark:text-white">Dark Mode</div>
                    <div className="text-xs text-gray-500 dark:text-white/50">Adjust the appearance of the app</div>
                 </div>
              </div>
              <button
                type="button"
                onClick={onToggleTheme}
                className={`relative w-14 h-8 rounded-full transition-colors duration-300 focus:outline-none ring-2 ring-offset-2 ring-offset-transparent ${theme === 'dark' ? 'bg-purple-600 ring-purple-500/50' : 'bg-gray-300 ring-gray-300'}`}
              >
                <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-md transition-transform duration-300 transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </button>
           </div>
        </GlassCard>

        {/* Personal Details Card */}
        <GlassCard className="p-6 md:p-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-purple-500 dark:text-purple-400" /> Personal Details
          </h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
               <label className="text-sm text-gray-600 dark:text-white/60">Display Name</label>
               <GlassInput 
                 value={editedProfile.name} 
                 onChange={(e) => handleChange('name', e.target.value)} 
               />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="space-y-2">
                 <label className="text-sm text-gray-600 dark:text-white/60 flex items-center gap-1"><Sparkles className="w-3 h-3"/> Age</label>
                 <GlassInput 
                   type="number" 
                   value={editedProfile.age} 
                   onChange={(e) => handleChange('age', parseInt(e.target.value))} 
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-sm text-gray-600 dark:text-white/60 flex items-center gap-1"><Ruler className="w-3 h-3"/> Height (cm)</label>
                 <GlassInput 
                   type="number" 
                   value={editedProfile.height} 
                   onChange={(e) => handleChange('height', parseInt(e.target.value))} 
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-sm text-gray-600 dark:text-white/60 flex items-center gap-1"><Scale className="w-3 h-3"/> Weight (kg)</label>
                 <GlassInput 
                   type="number" 
                   value={editedProfile.weight} 
                   onChange={(e) => handleChange('weight', parseInt(e.target.value))} 
                 />
               </div>
            </div>
          </div>
        </GlassCard>

        {/* Goals Card */}
        <GlassCard className="p-6 md:p-8">
           <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-pink-500 dark:text-pink-400" /> Fitness Goals
          </h2>
           <div className="space-y-4">
              <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-800 dark:text-purple-200 text-sm mb-4">
                 Changing your goal will regenerate your weekly workout plan.
              </div>
              <label className="text-sm text-gray-600 dark:text-white/60">Current Goal</label>
              <GlassSelect 
                value={editedProfile.goal} 
                onChange={(e) => handleChange('goal', e.target.value as FitnessGoal)}
              >
                 {Object.values(FitnessGoal).map(g => (
                   <option key={g} value={g} className="text-gray-900">{g}</option>
                 ))}
              </GlassSelect>
           </div>
        </GlassCard>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4 pt-4">
          <GlassButton 
            type="submit" 
            disabled={!isDirty}
            className="flex-1"
          >
            <Save className="w-4 h-4" /> Save Changes
          </GlassButton>
          
          <GlassButton 
            type="button" 
            variant="secondary"
            onClick={() => onUpdateProfile(editedProfile, true)}
            className="flex-1"
          >
            <RotateCcw className="w-4 h-4" /> Regenerate Plan
          </GlassButton>
        </div>

        {/* Danger Zone */}
        <div className="pt-8 border-t border-gray-200 dark:border-white/10 mt-8">
           <h3 className="text-red-500 dark:text-red-400 font-medium mb-4 text-sm uppercase tracking-wider">Danger Zone</h3>
           <button 
             type="button"
             onClick={onResetApp}
             className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 text-sm flex items-center gap-2 transition-colors px-4 py-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg w-full md:w-auto justify-center"
           >
             <Trash2 className="w-4 h-4" /> Reset All Data & Start Over
           </button>
        </div>

      </form>
    </div>
  );
};

export default ProfileSettings;