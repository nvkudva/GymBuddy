import React, { useState, useEffect } from 'react';
import { UserProfile, FitnessGoal } from '../types';
import { GlassCard, GlassButton, GlassInput, GlassSelect } from './ui/GlassCard';
import { Dumbbell, Ruler, Scale, User, Target, Sparkles, ChevronRight, Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
  isLoading: boolean;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, isLoading }) => {
  const [profile, setProfile] = useState<UserProfile>({
    id: '', // Will be set on submit
    name: '',
    age: 25,
    height: 175,
    weight: 70,
    goal: FitnessGoal.FITNESS
  });

  const [loadingStep, setLoadingStep] = useState(0);
  const loadingSteps = [
    "Analyzing biometrics...",
    "Calculating metabolic rate...",
    "Structuring weekly split...",
    "Selecting optimal exercises...",
    "Assigning rest periods...",
    "Finalizing your GymBuddy plan..."
  ];

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingStep(prev => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
      }, 1500); // Change step every 1.5s
      return () => clearInterval(interval);
    } else {
      setLoadingStep(0);
    }
  }, [isLoading]);

  const handleChange = (field: keyof UserProfile, value: string | number) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Generate ID if not present (though App.tsx handles it too, good to have here)
    const completeProfile = { ...profile, id: profile.id || uuidv4() };
    onComplete(completeProfile);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white text-center p-6 relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center">
            {/* Animated Logo */}
            <div className="relative w-24 h-24 mb-10">
                <div className="absolute inset-0 rounded-full border-t-4 border-l-4 border-purple-500 animate-spin" style={{ animationDuration: '1s' }}></div>
                <div className="absolute inset-3 rounded-full border-b-4 border-r-4 border-blue-500 animate-spin-reverse" style={{ animationDuration: '1.5s' }}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <Sparkles className="w-8 h-8 text-white opacity-90 animate-pulse" />
                </div>
            </div>
            
            <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-blue-200 animate-pulse">
              Building Your Routine
            </h2>
            
            {/* Dynamic Progress Log */}
            <div className="h-8 overflow-hidden relative w-full max-w-xs">
                {loadingSteps.map((step, index) => (
                   <div 
                     key={index}
                     className={`absolute inset-0 flex items-center justify-center transition-all duration-500 transform
                        ${index === loadingStep ? 'opacity-100 translate-y-0' : index < loadingStep ? 'opacity-0 -translate-y-full' : 'opacity-0 translate-y-full'}
                     `}
                   >
                     <span className="text-white/70 font-mono text-sm">{step}</span>
                   </div>
                ))}
            </div>

            {/* Progress Bar */}
            <div className="w-64 h-1 bg-white/10 rounded-full mt-6 overflow-hidden">
               <div 
                 className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500 ease-out"
                 style={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
               />
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
      <GlassCard className="w-full max-w-2xl p-8 md:p-12 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl shadow-lg shadow-purple-500/20">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">GymBuddy</h1>
            <p className="text-white/50">Premium AI Fitness Tracker</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-white/80">
              <User className="w-4 h-4 text-blue-400" /> Name
            </label>
            <GlassInput 
              type="text" 
              required
              placeholder="Your name" 
              value={profile.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-white/80">
                <Sparkles className="w-4 h-4 text-yellow-400" /> Age
              </label>
              <GlassInput 
                type="number" 
                required
                min={10} max={100}
                value={profile.age}
                onChange={(e) => handleChange('age', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-white/80">
                <Ruler className="w-4 h-4 text-green-400" /> Height (cm)
              </label>
              <GlassInput 
                type="number" 
                required
                min={100} max={250}
                value={profile.height}
                onChange={(e) => handleChange('height', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-white/80">
                <Scale className="w-4 h-4 text-pink-400" /> Weight (kg)
              </label>
              <GlassInput 
                type="number" 
                required
                min={30} max={300}
                value={profile.weight}
                onChange={(e) => handleChange('weight', parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-white/80">
              <Target className="w-4 h-4 text-red-400" /> Primary Goal
            </label>
            <GlassSelect 
              value={profile.goal}
              onChange={(e) => handleChange('goal', e.target.value as FitnessGoal)}
            >
              {Object.values(FitnessGoal).map(g => (
                <option key={g} value={g} className="text-black">{g}</option>
              ))}
            </GlassSelect>
          </div>

          <div className="pt-6">
            <GlassButton type="submit" className="w-full group relative overflow-hidden">
              <span className="relative z-10 flex items-center gap-2">
                Create My Plan <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </GlassButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};

export default Onboarding;